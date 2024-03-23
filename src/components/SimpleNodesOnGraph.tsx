import { useEffect, useState } from "react";
import { GraphNode } from "../lib/navigable-small-world/graph-node";
import { calculateEuclidianDistance } from "../lib/navigable-small-world/helpers";

export function SimpleNodesOnGraph() {
  const [svgSize, setSvgSize] = useState(500);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setSvgSize(Math.min(Math.max(window.innerWidth - 100, 100), 500));
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  return (
    <div className="container mx-auto sm:px-6 lg:px-8 flex flex-col pb-8 w-full">
      <div className="flex flex-col justify-center align-middle transform">
        <svg
          width={svgSize}
          height={svgSize}
          preserveAspectRatio="xMidYMid meet"
          className="mx-auto border-2 border-black"
          style={{ width: svgSize, height: svgSize }}
        >
          <g
            stroke="grey"
            strokeWidth="0.5"
            strokeDasharray="5,5"
            opacity={0.5}
          >
            {[...Array(7)].map((_, i) => (
              <line
                x1={(i * svgSize) / 7}
                y1={0}
                x2={(i * svgSize) / 7}
                y2={svgSize}
                key={`vertical${i}`}
              />
            ))}
            {[...Array(7)].map((_, i) => (
              <line
                x1={0}
                y1={(i * svgSize) / 7}
                x2={svgSize}
                y2={(i * svgSize) / 7}
                key={`horizontal${i}`}
              />
            ))}
          </g>
          <line
            x1={6 * (svgSize / 7)}
            y1={1 * (svgSize / 7)}
            x2={3 * (svgSize / 7)}
            y2={4 * (svgSize / 7)}
            stroke="black"
          />
          <text
            x={(6 * (svgSize / 7) + 3 * (svgSize / 7)) / 2}
            y={(1 * (svgSize / 7) + 4 * (svgSize / 7)) / 2}
            fill="black"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            {calculateEuclidianDistance(
              new GraphNode(1, [6, 1]),
              new GraphNode(3, [3, 4])
            ).toFixed(2)}
          </text>
          <line
            x1={1 * (svgSize / 7)}
            y1={6 * (svgSize / 7)}
            x2={3 * (svgSize / 7)}
            y2={4 * (svgSize / 7)}
            stroke="green"
            strokeWidth="3"
          />
          <text
            x={(1 * (svgSize / 7) + 3 * (svgSize / 7)) / 2}
            y={(6 * (svgSize / 7) + 4 * (svgSize / 7)) / 2}
            fill="green"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            {calculateEuclidianDistance(
              new GraphNode(2, [1, 6]),
              new GraphNode(3, [3, 4])
            ).toFixed(2)}
          </text>
          <circle
            cx={6 * (svgSize / 7)}
            cy={1 * (svgSize / 7)}
            r="10"
            stroke="black"
            strokeWidth="3"
            fill="white"
          />
          <text
            x={6 * (svgSize / 7)}
            y={1 * (svgSize / 7)}
            fill="black"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            {"1"}
          </text>
          <circle
            cx={1 * (svgSize / 7)}
            cy={6 * (svgSize / 7)}
            r="10"
            stroke="black"
            strokeWidth="3"
            fill="white"
          />
          <text
            x={1 * (svgSize / 7)}
            y={6 * (svgSize / 7)}
            fill="black"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            {"2"}
          </text>
          <text
            x={1 * (svgSize / 7)}
            y={6 * (svgSize / 7) + 20}
            fill="black"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            {"(0, 5)"}
          </text>
          <text
            x={6 * (svgSize / 7)}
            y={1 * (svgSize / 7) + 20}
            fill="black"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            {"(5, 0)"}
          </text>
          <text
            x={3 * (svgSize / 7)}
            y={4 * (svgSize / 7) + 20}
            fill="black"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            {"(2, 3)"}
          </text>
          <circle
            cx={3 * (svgSize / 7)}
            cy={4 * (svgSize / 7)}
            r="10"
            stroke="black"
            strokeWidth="3"
            fill="yellow"
          />
          <text
            x={3 * (svgSize / 7)}
            y={4 * (svgSize / 7)}
            fill="black"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            {"3"}
          </text>
        </svg>
      </div>
    </div>
  );
}
