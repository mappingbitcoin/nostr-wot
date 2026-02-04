"use client";

import { useCallback, useRef, useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useGraph } from "@/contexts/GraphContext";
import { useNodeSelection } from "@/hooks/useNodeSelection";
import { useGraphData } from "@/hooks/useGraphData";
import { GraphNode, GraphEdge } from "@/lib/graph/types";
import { calculateTrustScore, getTrustColorHex } from "@/lib/graph/colors";

// Use 2D graph for much better performance (canvas-based, not WebGL meshes)
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-900">
      <div className="text-gray-500">Loading graph...</div>
    </div>
  ),
});

interface GraphCanvasProps {
  width: number;
  height: number;
}

// Performance thresholds
const MAX_VISIBLE_NODES = 10000;
const MAX_VISIBLE_LINKS = 20000;
const DISABLE_SIMULATION_THRESHOLD = 2000; // Disable physics above this

export default function GraphCanvas({ width, height }: GraphCanvasProps) {
  const t = useTranslations("playground");
  const { filteredData, state } = useGraph();
  const { settings } = state;
  const { select, setHovered, activeNode } = useNodeSelection();
  const { expandNodeFollows } = useGraphData();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(null);
  const [showStartPrompt, setShowStartPrompt] = useState(true);

  // Check if we should use static layout (no physics) for performance
  const useStaticLayout = filteredData.nodes.length > DISABLE_SIMULATION_THRESHOLD;

  // Limit data and pre-compute positions for large graphs
  const visibleData = useMemo(() => {
    const nodes = filteredData.nodes.slice(0, MAX_VISIBLE_NODES);
    const nodeIds = new Set(nodes.map(n => n.id));

    // Only include links where both nodes are visible
    const links = filteredData.links
      .filter(l => {
        const sourceId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
        const targetId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
        return nodeIds.has(sourceId) && nodeIds.has(targetId);
      })
      .slice(0, MAX_VISIBLE_LINKS);

    // Pre-compute positions for large graphs (radial layout by distance)
    if (useStaticLayout) {
      const nodesByDistance = new Map<number, GraphNode[]>();
      for (const node of nodes) {
        const dist = node.distance;
        if (!nodesByDistance.has(dist)) {
          nodesByDistance.set(dist, []);
        }
        nodesByDistance.get(dist)!.push(node);
      }

      // Position nodes in concentric circles
      for (const [distance, distNodes] of nodesByDistance) {
        const radius = distance * 150; // 150px per hop
        const angleStep = (2 * Math.PI) / distNodes.length;

        distNodes.forEach((node, i) => {
          const angle = i * angleStep + (distance * 0.5); // Offset each ring
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (node as any).fx = radius * Math.cos(angle);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (node as any).fy = radius * Math.sin(angle);
        });
      }
    }

    return { nodes, links };
  }, [filteredData, useStaticLayout]);

  // Pre-compute colors for performance
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

  // Hide prompt when graph has more than just the root node
  useEffect(() => {
    if (filteredData.nodes.length > 1) {
      setShowStartPrompt(false);
    }
  }, [filteredData.nodes.length]);

  // Node click handler
  const handleNodeClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any) => {
      const graphNode = node as GraphNode;
      select(graphNode);

      // Expand on click (including root node)
      if (graphNode.distance < 3) {
        expandNodeFollows(graphNode.id);
        setShowStartPrompt(false);
      }

      // Center on node
      if (graphRef.current) {
        graphRef.current.centerAt(node.x, node.y, 500);
        graphRef.current.zoom(2, 500);
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

  // Custom canvas node rendering - much faster than Three.js
  const paintNode = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const graphNode = node as GraphNode;
      const size = graphNode.isRoot ? 8 : 4;
      const color = nodeColors.get(graphNode.id) || "#666";

      // Draw node
      ctx.beginPath();
      ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      // Draw glow for root
      if (graphNode.isRoot) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, size + 4, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(99, 102, 241, 0.3)";
        ctx.fill();
      }

      // Draw label only when zoomed in enough
      if (globalScale > 1.5) {
        const label = graphNode.label || graphNode.id.slice(0, 8);
        ctx.font = `${10 / globalScale}px Sans-Serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = "#fff";
        ctx.fillText(label, node.x, node.y + size + 2);
      }
    },
    [nodeColors]
  );

  // Link color
  const getLinkColor = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (link: any) => {
      const graphLink = link as GraphEdge;
      const targetNode =
        typeof graphLink.target === "string"
          ? visibleData.nodes.find((n) => n.id === graphLink.target)
          : (graphLink.target as GraphNode);

      if (targetNode) {
        const trustScore = calculateTrustScore(
          targetNode.distance,
          targetNode.pathCount || 1
        );
        // Return with alpha for performance
        const hex = getTrustColorHex(trustScore);
        return hex + "40"; // 25% opacity
      }
      return "#ffffff20";
    },
    [visibleData.nodes]
  );

  // Center camera on root node after initial load
  useEffect(() => {
    if (graphRef.current && visibleData.nodes.length > 0) {
      const rootNode = visibleData.nodes.find((n) => n.isRoot);

      setTimeout(() => {
        if (rootNode && graphRef.current) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const node = rootNode as any;
          if (node.x !== undefined && node.y !== undefined) {
            graphRef.current.centerAt(node.x, node.y, 1000);
            graphRef.current.zoom(1.5, 1000);
          }
        }
      }, 500);
    }
  }, [visibleData.nodes.length]);

  if (typeof window === "undefined") {
    return (
      <div
        className="flex items-center justify-center bg-gray-900"
        style={{ width, height }}
      >
        <div className="text-gray-500">Loading graph...</div>
      </div>
    );
  }

  const isTruncated = filteredData.nodes.length > MAX_VISIBLE_NODES;

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      {/* eslint-disable @typescript-eslint/no-explicit-any */}
      <ForceGraph2D
        ref={graphRef}
        width={width}
        height={height}
        graphData={visibleData as any}
        nodeId="id"
        nodeCanvasObject={paintNode as any}
        nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
          const size = (node as GraphNode).isRoot ? 12 : 8;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }}
        onNodeClick={handleNodeClick as any}
        onNodeHover={handleNodeHover as any}
        onBackgroundClick={handleBackgroundClick}
        linkColor={getLinkColor as any}
        linkWidth={useStaticLayout ? 0.3 : 0.5}
        linkDirectionalArrowLength={settings.showArrows && !useStaticLayout ? 2 : 0}
        linkDirectionalArrowRelPos={1}
        // Disable simulation for large graphs (positions pre-computed)
        d3AlphaDecay={useStaticLayout ? 1 : 0.05}
        d3VelocityDecay={useStaticLayout ? 1 : 0.4}
        cooldownTicks={useStaticLayout ? 0 : 100}
        warmupTicks={useStaticLayout ? 0 : 50}
        enableNodeDrag={!useStaticLayout}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        backgroundColor="#111827"
        dagMode={!useStaticLayout && settings.layout === "radial" ? "radialout" : undefined}
        dagLevelDistance={50}
        minZoom={0.1}
        maxZoom={10}
      />
      {/* eslint-enable @typescript-eslint/no-explicit-any */}

      {/* Node count indicator */}
      <div className="absolute top-4 right-4 bg-gray-800/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs">
        <span className="text-gray-400">Nodes: </span>
        <span className="text-white font-medium">{visibleData.nodes.length.toLocaleString()}</span>
        {isTruncated && (
          <span className="text-yellow-500 ml-1">
            / {filteredData.nodes.length.toLocaleString()}
          </span>
        )}
        <span className="text-gray-400 ml-3">Links: </span>
        <span className="text-white font-medium">{visibleData.links.length.toLocaleString()}</span>
        {useStaticLayout && (
          <span className="text-blue-400 ml-3" title="Physics disabled for performance">
            Static
          </span>
        )}
      </div>

      {/* Tooltip */}
      {activeNode && (
        <div className="absolute bottom-4 left-4 bg-gray-800/90 backdrop-blur-sm rounded-lg px-4 py-3 max-w-xs">
          <div className="font-medium text-white truncate">
            {activeNode.label || activeNode.id.slice(0, 16)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            <span>{activeNode.distance} hop{activeNode.distance !== 1 ? 's' : ''}</span>
            <span className="mx-1">·</span>
            <span>{activeNode.pathCount || 1} path{(activeNode.pathCount || 1) !== 1 ? 's' : ''}</span>
            <span className="mx-1">·</span>
            <span className="text-trust-green">{Math.round(calculateTrustScore(activeNode.distance, activeNode.pathCount || 1) * 100)}% trust</span>
          </div>
          <div className="text-xs text-gray-500 mt-1 font-mono truncate">
            {activeNode.id.slice(0, 16)}...
          </div>
        </div>
      )}

      {/* Initial prompt to click root node */}
      {showStartPrompt && filteredData.nodes.length === 1 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-gray-800/90 backdrop-blur-sm border border-primary/50 rounded-xl px-6 py-4 shadow-2xl animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">{t("graph.clickToExplore")}</p>
                <p className="text-gray-400 text-sm">{t("graph.clickToExploreDesc")}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
