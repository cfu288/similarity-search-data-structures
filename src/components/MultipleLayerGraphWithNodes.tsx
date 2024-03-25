import React, { useCallback, useEffect, useRef, useState } from "react";
import { GraphNode } from "../lib/navigable-small-world/graph-node";
import { calculateEuclidianDistance } from "../lib/navigable-small-world/helpers";

export function MultipleLayerGraphWithNodes({
  nodes = [new GraphNode(1, [5, 0]), new GraphNode(2, [0, 5])],
  targetNode = new GraphNode(3, [2, 3]),
}: {
  nodes: GraphNode[];
  targetNode: GraphNode;
}) {
  // Initialize SVG size state
  const [svgSize, setSvgSize] = useState(500);
  const svgParentRef = useRef<HTMLDivElement>(null);
  const getSvgParentWidth = useCallback(() => {
    return svgParentRef.current ? svgParentRef.current.offsetWidth : 0;
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (svgParentRef.current) {
        setSvgSize(Math.min(Math.max(getSvgParentWidth(), 100), 500));
      }
    }
  }, [getSvgParentWidth]);

  // Handle window resize event
  useEffect(() => {
    const handleWindowResize = () => {
      if (typeof window !== "undefined") {
        // Adjust SVG size based on window size, with a minimum of 100 and a maximum of 500
        setSvgSize(Math.min(Math.max(getSvgParentWidth(), 100), 500));
      }
    };

    if (typeof window !== "undefined") {
      // Add event listener for window resize
      window.addEventListener("resize", handleWindowResize);

      // Cleanup function to remove event listener
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [getSvgParentWidth]);

  // Calculate distances from each node to the target node
  const nodeDistances = nodes.map((node) =>
    calculateEuclidianDistance(node, targetNode)
  );
  // Find the shortest distance
  const shortestNodeDistance = Math.min(...nodeDistances);

  // Calculate the range of x and y coordinates
  const nodeXCoordinates = nodes.map((node) => node.vector[0]);
  const nodeYCoordinates = nodes.map((node) => node.vector[1]);
  const minNodeX = Math.min(...nodeXCoordinates);
  const maxNodeX = Math.max(...nodeXCoordinates);
  const xCoordinateRange = maxNodeX - minNodeX + 2;
  const minNodeY = Math.min(...nodeYCoordinates);
  const maxNodeY = Math.max(...nodeYCoordinates);
  const yCoordinateRange = maxNodeY - minNodeY + 2;

  // Determine the shared range between x and y coordinates
  const sharedCoordinateRange = Math.max(xCoordinateRange, yCoordinateRange);

  const layers = 3;

  const [rotateZAngle, setRotateZAngle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotateZAngle((angle) => angle + 360 / 20);
    }, 1000);

    return () => clearInterval(interval);
  }, [rotateZAngle]);

  return (
    <div
      className="relative container mx-auto sm:px-6 lg:px-8 flex flex-col pb-8 w-full"
      style={{
        minHeight: svgSize,
      }}
    >
      <div
        className="flex flex-col-rev justify-center align-middle"
        ref={svgParentRef}
      >
        {new Array(layers).fill(0).map((_, i) => {
          return (
            <svg
              key={i}
              width={svgSize}
              height={svgSize}
              preserveAspectRatio="xMidYMid meet"
              className="mx-auto border-2 border-black"
              style={{
                transform: `perspective(900px) rotateX(60deg) rotateZ(${rotateZAngle}deg)`,
                transition: "transform 1s linear",
                top: `calc(${i * 50}px - ${svgSize / layers - 50}px)`,
                position: "absolute",
              }}
            >
              {/* grid lines and y and x axis */}
              <g
                stroke="grey"
                strokeWidth="0.5"
                strokeDasharray="5,5"
                opacity={0.5}
              >
                {[
                  ...Array(
                    Math.max(...nodes.map((node) => node.vector[0])) + 2
                  ),
                ].map((_, i) => (
                  <line
                    x1={
                      ((i + 1) * svgSize) /
                      (Math.max(...nodes.map((node) => node.vector[0])) + 2)
                    }
                    y1={0}
                    x2={
                      ((i + 1) * svgSize) /
                      (Math.max(...nodes.map((node) => node.vector[0])) + 2)
                    }
                    y2={svgSize}
                    stroke={i === 0 ? "black" : "grey"}
                    strokeWidth={i === 0 ? "2" : "0.5"}
                    key={`vertical${i}`}
                  />
                ))}
                {[
                  ...Array(
                    Math.max(...nodes.map((node) => node.vector[1])) + 2
                  ),
                ].map((_, i) => (
                  <line
                    x1={0}
                    y1={
                      svgSize -
                      ((i + 1) * svgSize) /
                        (Math.max(...nodes.map((node) => node.vector[1])) + 2)
                    }
                    x2={svgSize}
                    y2={
                      svgSize -
                      ((i + 1) * svgSize) /
                        (Math.max(...nodes.map((node) => node.vector[1])) + 2)
                    }
                    stroke={i === 0 ? "black" : "grey"}
                    strokeWidth={i === 0 ? "2" : "0.5"}
                    key={`horizontal${i}`}
                  />
                ))}
              </g>
              {/* draw nodes and connections */}
              {nodes.map((node, index) => (
                <g key={node.id}>
                  <line
                    x1={
                      (node.vector[0] + 1) * (svgSize / sharedCoordinateRange)
                    }
                    y1={
                      svgSize -
                      (node.vector[1] + 1) * (svgSize / sharedCoordinateRange)
                    }
                    x2={
                      (targetNode.vector[0] + 1) *
                      (svgSize / sharedCoordinateRange)
                    }
                    y2={
                      svgSize -
                      (targetNode.vector[1] + 1) *
                        (svgSize / sharedCoordinateRange)
                    }
                    stroke={
                      nodeDistances[index] === shortestNodeDistance
                        ? "green"
                        : "black"
                    }
                    strokeWidth={
                      nodeDistances[index] === shortestNodeDistance
                        ? "2"
                        : "0.5"
                    }
                    opacity={0.5}
                  />
                  <text
                    x={
                      ((node.vector[0] + 1) *
                        (svgSize / sharedCoordinateRange) +
                        (targetNode.vector[0] + 1) *
                          (svgSize / sharedCoordinateRange)) /
                      2
                    }
                    y={
                      svgSize -
                      ((node.vector[1] + 1) *
                        (svgSize / sharedCoordinateRange) +
                        (targetNode.vector[1] + 1) *
                          (svgSize / sharedCoordinateRange)) /
                        2
                    }
                    fill={
                      nodeDistances[index] === shortestNodeDistance
                        ? "green"
                        : "black"
                    }
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {nodeDistances[index].toFixed(2)}
                  </text>
                  <circle
                    cx={
                      (node.vector[0] + 1) * (svgSize / sharedCoordinateRange)
                    }
                    cy={
                      svgSize -
                      (node.vector[1] + 1) * (svgSize / sharedCoordinateRange)
                    }
                    r="10"
                    stroke="black"
                    strokeWidth="3"
                    fill="white"
                  />
                  <text
                    x={(node.vector[0] + 1) * (svgSize / sharedCoordinateRange)}
                    y={
                      svgSize -
                      (node.vector[1] + 1) * (svgSize / sharedCoordinateRange)
                    }
                    fill="black"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {node.id}
                  </text>
                  <text
                    x={(node.vector[0] + 1) * (svgSize / sharedCoordinateRange)}
                    y={
                      svgSize -
                      ((node.vector[1] + 1) *
                        (svgSize / sharedCoordinateRange) -
                        25)
                    }
                    fill="black"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {`(${node.vector[0]}, ${node.vector[1]})`}
                  </text>
                </g>
              ))}
              {/* draw target node */}
              <g>
                <circle
                  cx={
                    (targetNode.vector[0] + 1) *
                    (svgSize / sharedCoordinateRange)
                  }
                  cy={
                    svgSize -
                    (targetNode.vector[1] + 1) *
                      (svgSize / sharedCoordinateRange)
                  }
                  r="10"
                  stroke="black"
                  strokeWidth="3"
                  fill="yellow"
                />
                <text
                  x={
                    (targetNode.vector[0] + 1) *
                    (svgSize / sharedCoordinateRange)
                  }
                  y={
                    svgSize -
                    (targetNode.vector[1] + 1) *
                      (svgSize / sharedCoordinateRange)
                  }
                  fill="black"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {targetNode.id}
                </text>
                <text
                  x={
                    (targetNode.vector[0] + 1) *
                    (svgSize / sharedCoordinateRange)
                  }
                  y={
                    svgSize -
                    ((targetNode.vector[1] + 1) *
                      (svgSize / sharedCoordinateRange) -
                      25)
                  }
                  fill="black"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {`(${targetNode.vector[0]}, ${targetNode.vector[1]})`}
                </text>
              </g>
            </svg>
          );
        })}
      </div>
    </div>
  );
}
