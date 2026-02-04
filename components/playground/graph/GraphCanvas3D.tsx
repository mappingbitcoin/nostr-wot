"use client";

import { useCallback, useRef, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useGraph } from "@/contexts/GraphContext";
import { useNodeSelection } from "@/hooks/useNodeSelection";
import { useGraphData } from "@/hooks/useGraphData";
import { GraphNode, GraphEdge } from "@/lib/graph/types";
import { calculateTrustScore, getTrustColorHex } from "@/lib/graph/colors";

// Dynamic import for 3D graph (WebGL-based)
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-900">
      <div className="text-gray-500">Loading 3D graph...</div>
    </div>
  ),
});

interface GraphCanvas3DProps {
  width: number;
  height: number;
}

// Performance thresholds for 3D (lower than 2D due to WebGL overhead)
const MAX_VISIBLE_NODES_3D = 5000;
const MAX_VISIBLE_LINKS_3D = 10000;

export default function GraphCanvas3D({ width, height }: GraphCanvas3DProps) {
  const { filteredData } = useGraph();
  const { select, setHovered, activeNode } = useNodeSelection();
  const { expandNodeFollows } = useGraphData();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(null);

  // Limit data for performance
  const visibleData = useMemo(() => {
    const nodes = filteredData.nodes.slice(0, MAX_VISIBLE_NODES_3D);
    const nodeIds = new Set(nodes.map((n) => n.id));

    const links = filteredData.links
      .filter((l) => {
        const sourceId = typeof l.source === "string" ? l.source : (l.source as GraphNode).id;
        const targetId = typeof l.target === "string" ? l.target : (l.target as GraphNode).id;
        return nodeIds.has(sourceId) && nodeIds.has(targetId);
      })
      .slice(0, MAX_VISIBLE_LINKS_3D);

    return { nodes, links };
  }, [filteredData]);

  // Pre-compute colors
  const nodeColors = useMemo(() => {
    const colors = new Map<string, string>();
    for (const node of visibleData.nodes) {
      if (node.isRoot) {
        colors.set(node.id, "#6366f1");
      } else {
        const trustScore = calculateTrustScore(node.distance, node.pathCount || 1);
        colors.set(node.id, getTrustColorHex(trustScore));
      }
    }
    return colors;
  }, [visibleData.nodes]);

  // Node click handler
  const handleNodeClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any) => {
      if (!node) return;

      const graphNode = node as GraphNode;
      select(graphNode);

      // Expand on click
      if (graphNode.distance < 3) {
        expandNodeFollows(graphNode.id);
      }

      // Focus camera on node (with coordinate safety check)
      if (graphRef.current && typeof node.x === "number" && typeof node.y === "number" && typeof node.z === "number") {
        try {
          const distance = 200;
          const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
          graphRef.current.cameraPosition(
            {
              x: node.x * distRatio,
              y: node.y * distRatio,
              z: node.z * distRatio,
            },
            node,
            2000
          );
        } catch (err) {
          console.warn("Camera position error:", err);
        }
      }
    },
    [select, expandNodeFollows]
  );

  // Node hover handlers
  const handleNodeHover = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any) => {
      setHovered(node ? (node as GraphNode) : null);
    },
    [setHovered]
  );

  // Background click to deselect
  const handleBackgroundClick = useCallback(() => {
    select(null);
  }, [select]);

  // Node color
  const getNodeColor = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any) => {
      return nodeColors.get(node.id) || "#666";
    },
    [nodeColors]
  );

  // Node size based on distance (root is larger)
  const getNodeSize = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any) => {
      const graphNode = node as GraphNode;
      if (graphNode.isRoot) return 12;
      // Size decreases with distance
      return Math.max(3, 8 - graphNode.distance * 1.5);
    },
    []
  );

  // Link color based on target trust
  const getLinkColor = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (link: any) => {
      const graphLink = link as GraphEdge;
      const targetNode =
        typeof graphLink.target === "string"
          ? visibleData.nodes.find((n) => n.id === graphLink.target)
          : (graphLink.target as GraphNode);

      if (targetNode) {
        const trustScore = calculateTrustScore(targetNode.distance, targetNode.pathCount || 1);
        const hex = getTrustColorHex(trustScore);
        return hex + "60"; // 37% opacity
      }
      return "#ffffff30";
    },
    [visibleData.nodes]
  );

  // Center camera on root node initially
  useEffect(() => {
    if (graphRef.current && visibleData.nodes.length > 0) {
      const rootNode = visibleData.nodes.find((n) => n.isRoot);
      if (rootNode) {
        setTimeout(() => {
          if (graphRef.current) {
            graphRef.current.cameraPosition({ x: 0, y: 0, z: 500 }, { x: 0, y: 0, z: 0 }, 1000);
          }
        }, 500);
      }
    }
  }, [visibleData.nodes.length]);

  if (typeof window === "undefined") {
    return (
      <div className="flex items-center justify-center bg-gray-900" style={{ width, height }}>
        <div className="text-gray-500">Loading 3D graph...</div>
      </div>
    );
  }

  const isTruncated = filteredData.nodes.length > MAX_VISIBLE_NODES_3D;

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      {/* eslint-disable @typescript-eslint/no-explicit-any */}
      <ForceGraph3D
        ref={graphRef}
        width={width}
        height={height}
        graphData={visibleData as any}
        nodeId="id"
        nodeColor={getNodeColor as any}
        nodeVal={getNodeSize as any}
        nodeLabel={(node: any) => {
          const n = node as GraphNode;
          return `${n.label || n.id.slice(0, 12)}... (${n.distance} hops)`;
        }}
        onNodeClick={handleNodeClick as any}
        onNodeHover={handleNodeHover as any}
        onBackgroundClick={handleBackgroundClick}
        linkColor={getLinkColor as any}
        linkWidth={0.5}
        linkOpacity={0.4}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={1}
        backgroundColor="#111827"
        showNavInfo={false}
        enableNodeDrag={false}
        enableNavigationControls={true}
        controlType="orbit"
      />
      {/* eslint-enable @typescript-eslint/no-explicit-any */}

      {/* Node count indicator */}
      <div className="absolute top-4 right-4 bg-gray-800/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs">
        <span className="text-blue-400 mr-2">3D</span>
        <span className="text-gray-400">Nodes: </span>
        <span className="text-white font-medium">{visibleData.nodes.length.toLocaleString()}</span>
        {isTruncated && (
          <span className="text-yellow-500 ml-1">
            / {filteredData.nodes.length.toLocaleString()}
          </span>
        )}
        <span className="text-gray-400 ml-3">Links: </span>
        <span className="text-white font-medium">{visibleData.links.length.toLocaleString()}</span>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-4 right-4 bg-gray-800/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-400">
        <div>Left-drag to rotate • Right-drag to pan • Scroll to zoom • Click to expand</div>
      </div>

      {/* Tooltip */}
      {activeNode && (
        <div className="absolute bottom-4 left-4 bg-gray-800/90 backdrop-blur-sm rounded-lg px-4 py-3 max-w-xs">
          <div className="font-medium text-white truncate">
            {activeNode.label || activeNode.id.slice(0, 16)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            <span>{activeNode.distance} hop{activeNode.distance !== 1 ? "s" : ""}</span>
            <span className="mx-1">·</span>
            <span>{activeNode.pathCount || 1} path{(activeNode.pathCount || 1) !== 1 ? "s" : ""}</span>
            <span className="mx-1">·</span>
            <span className="text-trust-green">{Math.round(calculateTrustScore(activeNode.distance, activeNode.pathCount || 1) * 100)}% trust</span>
          </div>
          <div className="text-xs text-gray-500 mt-1 font-mono truncate">
            {activeNode.id.slice(0, 16)}...
          </div>
        </div>
      )}
    </div>
  );
}
