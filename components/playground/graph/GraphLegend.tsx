"use client";

import { useGraph } from "@/contexts/GraphContext";
import {
  calculateTrustScore,
  getTrustColorHex,
  DISTANCE_WEIGHTS,
  TRUST_THRESHOLDS,
} from "@/lib/graph/colors";

export default function GraphLegend() {
  const { state } = useGraph();
  const { settings } = state;

  // Generate distance-based colors using the extension formula
  const getDistanceColor = (distance: number) => {
    const score = calculateTrustScore(distance, 1);
    return getTrustColorHex(score);
  };

  if (settings.colorMode === "distance") {
    return (
      <div className="absolute bottom-14 left-4 bg-gray-800/90 backdrop-blur rounded-lg border border-gray-700 p-3 z-10">
        <p className="text-xs font-medium text-gray-400 mb-2">Distance</p>
        <div className="flex flex-col gap-1.5">
          <LegendItem color="#6366f1" label="You (root)" />
          <LegendItem
            color={getDistanceColor(1)}
            label={`1 hop (${Math.round(DISTANCE_WEIGHTS[1] * 100)}%)`}
          />
          <LegendItem
            color={getDistanceColor(2)}
            label={`2 hops (${Math.round(DISTANCE_WEIGHTS[2] * 100)}%)`}
          />
          <LegendItem
            color={getDistanceColor(3)}
            label={`3 hops (${Math.round(DISTANCE_WEIGHTS[3] * 100)}%)`}
          />
          <LegendItem
            color={getDistanceColor(4)}
            label={`4+ hops (${Math.round(DISTANCE_WEIGHTS[4] * 100)}%)`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-14 left-4 bg-gray-800/90 backdrop-blur rounded-lg border border-gray-700 p-3 z-10">
      <p className="text-xs font-medium text-gray-400 mb-2">Trust Score</p>

      {/* Trust gradient bar */}
      <div className="mb-3">
        <div
          className="h-2 rounded-full w-full"
          style={{
            background: `linear-gradient(to right,
              ${getTrustColorHex(0)} 0%,
              ${getTrustColorHex(0.3)} 30%,
              ${getTrustColorHex(0.5)} 50%,
              ${getTrustColorHex(0.7)} 70%,
              ${getTrustColorHex(1.0)} 100%)`,
          }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-500">0%</span>
          <span className="text-[10px] text-gray-500">50%</span>
          <span className="text-[10px] text-gray-500">100%</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <LegendItem color="#6366f1" label="You (root)" />
        <LegendItem
          color={getTrustColorHex(0.85)}
          label={`Trusted (≥${Math.round(TRUST_THRESHOLDS.high * 100)}%)`}
        />
        <LegendItem
          color={getTrustColorHex(0.5)}
          label={`Neutral (${Math.round(TRUST_THRESHOLDS.medium * 100)}-${Math.round(TRUST_THRESHOLDS.high * 100)}%)`}
        />
        <LegendItem
          color={getTrustColorHex(0.15)}
          label={`Untrusted (<${Math.round(TRUST_THRESHOLDS.medium * 100)}%)`}
        />
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700">
        <p className="text-xs font-medium text-gray-400 mb-2">Path Bonus</p>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: getTrustColorHex(calculateTrustScore(2, 1)) }}
            />
            <span className="text-[10px] text-gray-400">2 hops, 1 path = {Math.round(calculateTrustScore(2, 1) * 100)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: getTrustColorHex(calculateTrustScore(2, 5)) }}
            />
            <span className="text-[10px] text-gray-400">2 hops, 5 paths = {Math.round(calculateTrustScore(2, 5) * 100)}%</span>
          </div>
        </div>
        <p className="text-[10px] text-gray-500 mt-2 italic">
          More paths = stronger trust
        </p>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700">
        <p className="text-xs font-medium text-gray-400 mb-2">Connections</p>
        <div className="flex flex-col gap-1.5">
          <EdgeLegendItem color="#6b7280" label="Follow" dashed={false} />
          <EdgeLegendItem
            color={getTrustColorHex(0.85)}
            label="Mutual"
            dashed={false}
            thick
          />
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-gray-300">{label}</span>
    </div>
  );
}

function EdgeLegendItem({
  color,
  label,
  dashed,
  thick,
}: {
  color: string;
  label: string;
  dashed: boolean;
  thick?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-5 flex items-center justify-center">
        <div
          className={`w-full ${thick ? "h-0.5" : "h-px"}`}
          style={{
            backgroundColor: color,
            borderStyle: dashed ? "dashed" : "solid",
          }}
        />
      </div>
      <span className="text-xs text-gray-300">{label}</span>
    </div>
  );
}
