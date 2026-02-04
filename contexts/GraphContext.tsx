"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import {
  GraphData,
  GraphFilters,
  GraphSettings,
  GraphStats,
  GraphNode,
  ViewMode,
  NodeProfile,
  DEFAULT_FILTERS,
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
} from "@/lib/graph/types";
import { filterGraphData, calculateStats } from "@/lib/graph/transformers";
import { calculateTrustScore } from "@/lib/graph/colors";

// State
interface GraphState {
  data: GraphData;
  filters: GraphFilters;
  settings: GraphSettings;
  viewMode: ViewMode;
  selectedNode: GraphNode | null;
  hoveredNode: GraphNode | null;
  rootPubkey: string | null;
  isLoading: boolean;
  error: string | null;
  profiles: Map<string, NodeProfile>;
  expandedNodes: Set<string>;
}

// Actions
type GraphAction =
  | { type: "SET_DATA"; payload: GraphData }
  | { type: "SET_FILTERS"; payload: Partial<GraphFilters> }
  | { type: "RESET_FILTERS" }
  | { type: "SET_SETTINGS"; payload: Partial<GraphSettings> }
  | { type: "SET_VIEW_MODE"; payload: ViewMode }
  | { type: "SELECT_NODE"; payload: GraphNode | null }
  | { type: "HOVER_NODE"; payload: GraphNode | null }
  | { type: "SET_ROOT"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "ADD_PROFILES"; payload: Map<string, NodeProfile> }
  | { type: "EXPAND_NODE"; payload: string }
  | { type: "COLLAPSE_NODE"; payload: string }
  | { type: "MERGE_DATA"; payload: GraphData };

// Initial state
const initialState: GraphState = {
  data: { nodes: [], links: [] },
  filters: DEFAULT_FILTERS,
  settings: DEFAULT_SETTINGS,
  viewMode: "graph",
  selectedNode: null,
  hoveredNode: null,
  rootPubkey: null,
  isLoading: false,
  error: null,
  profiles: new Map(),
  expandedNodes: new Set(),
};

// Reducer
function graphReducer(state: GraphState, action: GraphAction): GraphState {
  switch (action.type) {
    case "SET_DATA":
      return { ...state, data: action.payload };

    case "SET_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    case "RESET_FILTERS":
      return { ...state, filters: DEFAULT_FILTERS };

    case "SET_SETTINGS":
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case "SET_VIEW_MODE":
      return { ...state, viewMode: action.payload };

    case "SELECT_NODE":
      return { ...state, selectedNode: action.payload };

    case "HOVER_NODE":
      return { ...state, hoveredNode: action.payload };

    case "SET_ROOT":
      return { ...state, rootPubkey: action.payload };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "ADD_PROFILES": {
      const newProfiles = new Map(state.profiles);
      action.payload.forEach((profile, key) => {
        newProfiles.set(key, profile);
      });
      return { ...state, profiles: newProfiles };
    }

    case "EXPAND_NODE": {
      const newExpanded = new Set(state.expandedNodes);
      newExpanded.add(action.payload);
      return { ...state, expandedNodes: newExpanded };
    }

    case "COLLAPSE_NODE": {
      const newExpanded = new Set(state.expandedNodes);
      newExpanded.delete(action.payload);
      return { ...state, expandedNodes: newExpanded };
    }

    case "MERGE_DATA": {
      const existingNodeMap = new Map(state.data.nodes.map((n) => [n.id, n]));
      const existingLinkKeys = new Set(
        state.data.links.map((l) => `${l.source}-${l.target}`)
      );

      // Track which nodes get new incoming paths
      const nodePathIncrements = new Map<string, number>();

      // Filter new links and track path increments for existing nodes
      const newLinks = action.payload.links.filter((l) => {
        const key = `${l.source}-${l.target}`;
        if (existingLinkKeys.has(key)) {
          return false;
        }
        // If target node exists, increment its path count
        const targetId = typeof l.target === "string" ? l.target : l.target.id;
        if (existingNodeMap.has(targetId)) {
          const current = nodePathIncrements.get(targetId) || 0;
          nodePathIncrements.set(targetId, current + 1);
        }
        return true;
      });

      // Get new nodes (not already existing)
      const newNodes = action.payload.nodes.filter(
        (n) => !existingNodeMap.has(n.id)
      );

      // Update existing nodes with incremented path counts
      const updatedNodes = state.data.nodes.map((node) => {
        const pathIncrement = nodePathIncrements.get(node.id);
        if (pathIncrement) {
          const newPathCount = node.pathCount + pathIncrement;
          // Recalculate trust score with new path count using same formula as colors
          const newTrustScore = calculateTrustScore(node.distance, newPathCount);
          return {
            ...node,
            pathCount: newPathCount,
            trustScore: newTrustScore,
          };
        }
        return node;
      });

      return {
        ...state,
        data: {
          nodes: [...updatedNodes, ...newNodes],
          links: [...state.data.links, ...newLinks],
        },
      };
    }

    default:
      return state;
  }
}

// Context type
interface GraphContextType {
  // State
  state: GraphState;
  filteredData: GraphData;
  stats: GraphStats;

  // Data actions
  setData: (data: GraphData) => void;
  mergeData: (data: GraphData) => void;
  setRoot: (pubkey: string) => void;

  // Filter actions
  setFilters: (filters: Partial<GraphFilters>) => void;
  resetFilters: () => void;

  // Settings actions
  setSettings: (settings: Partial<GraphSettings>) => void;

  // View actions
  setViewMode: (mode: ViewMode) => void;

  // Node actions
  selectNode: (node: GraphNode | null) => void;
  hoverNode: (node: GraphNode | null) => void;
  expandNode: (pubkey: string) => void;
  collapseNode: (pubkey: string) => void;
  isNodeExpanded: (pubkey: string) => boolean;

  // Profile actions
  addProfiles: (profiles: Map<string, NodeProfile>) => void;
  getProfile: (pubkey: string) => NodeProfile | undefined;

  // Loading actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const GraphContext = createContext<GraphContextType | undefined>(undefined);

// Provider
export function GraphProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(graphReducer, initialState);

  // Compute filtered data
  const filteredData = useMemo(
    () => filterGraphData(state.data, state.filters),
    [state.data, state.filters]
  );

  // Compute stats from filtered data
  const stats = useMemo(() => calculateStats(filteredData), [filteredData]);

  // Actions
  const setData = useCallback((data: GraphData) => {
    dispatch({ type: "SET_DATA", payload: data });
  }, []);

  const mergeData = useCallback((data: GraphData) => {
    dispatch({ type: "MERGE_DATA", payload: data });
  }, []);

  const setRoot = useCallback((pubkey: string) => {
    dispatch({ type: "SET_ROOT", payload: pubkey });
  }, []);

  const setFilters = useCallback((filters: Partial<GraphFilters>) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
  }, []);

  const setSettings = useCallback((settings: Partial<GraphSettings>) => {
    dispatch({ type: "SET_SETTINGS", payload: settings });
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    dispatch({ type: "SET_VIEW_MODE", payload: mode });
  }, []);

  const selectNode = useCallback((node: GraphNode | null) => {
    dispatch({ type: "SELECT_NODE", payload: node });
  }, []);

  const hoverNode = useCallback((node: GraphNode | null) => {
    dispatch({ type: "HOVER_NODE", payload: node });
  }, []);

  const expandNode = useCallback((pubkey: string) => {
    dispatch({ type: "EXPAND_NODE", payload: pubkey });
  }, []);

  const collapseNode = useCallback((pubkey: string) => {
    dispatch({ type: "COLLAPSE_NODE", payload: pubkey });
  }, []);

  const isNodeExpanded = useCallback(
    (pubkey: string) => state.expandedNodes.has(pubkey),
    [state.expandedNodes]
  );

  const addProfiles = useCallback((profiles: Map<string, NodeProfile>) => {
    dispatch({ type: "ADD_PROFILES", payload: profiles });
  }, []);

  const getProfile = useCallback(
    (pubkey: string) => state.profiles.get(pubkey),
    [state.profiles]
  );

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error });
  }, []);

  const value = useMemo(
    () => ({
      state,
      filteredData,
      stats,
      setData,
      mergeData,
      setRoot,
      setFilters,
      resetFilters,
      setSettings,
      setViewMode,
      selectNode,
      hoverNode,
      expandNode,
      collapseNode,
      isNodeExpanded,
      addProfiles,
      getProfile,
      setLoading,
      setError,
    }),
    [
      state,
      filteredData,
      stats,
      setData,
      mergeData,
      setRoot,
      setFilters,
      resetFilters,
      setSettings,
      setViewMode,
      selectNode,
      hoverNode,
      expandNode,
      collapseNode,
      isNodeExpanded,
      addProfiles,
      getProfile,
      setLoading,
      setError,
    ]
  );

  return (
    <GraphContext.Provider value={value}>{children}</GraphContext.Provider>
  );
}

// Hook
export function useGraph() {
  const context = useContext(GraphContext);
  if (context === undefined) {
    throw new Error("useGraph must be used within a GraphProvider");
  }
  return context;
}
