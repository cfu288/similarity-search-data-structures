import React, { useCallback, useEffect, useRef, useState } from "react";

import { GraphNode } from "../lib/navigable-small-world/graph-node";
import { calculateEuclidianDistance } from "../lib/navigable-small-world/helpers";

export function SimpleNodesOnGraph({
  nodes = [new GraphNode(1, [5, 0]), new GraphNode(2, [0, 5])],
  targetNode = new GraphNode(0, [2, 3]),
}: {
  nodes: GraphNode[];
  targetNode: GraphNode;
}) {
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

  useEffect(() => {
    const handleWindowResize = () => {
      if (typeof window !== "undefined") {
        setSvgSize(Math.min(Math.max(getSvgParentWidth(), 100), 500));
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [getSvgParentWidth]);

  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [shortestNodeDistance, setShortestNodeDistance] = useState(Infinity);
  const [closestNode, setClosestNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentNodeIndex < nodes.length) {
        const node = nodes[currentNodeIndex];
        const distance = calculateEuclidianDistance(node, targetNode);
        if (distance < shortestNodeDistance) {
          setShortestNodeDistance(distance);
          setClosestNode(node);
        }
        setCurrentNodeIndex(currentNodeIndex + 1);
      } else {
        clearInterval(interval);
        setCurrentNodeIndex(0);
        setShortestNodeDistance(Infinity);
        setClosestNode(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentNodeIndex, nodes, targetNode, shortestNodeDistance]);

  const nodeXCoordinates = nodes.map((node) => node.vector[0]);
  const nodeYCoordinates = nodes.map((node) => node.vector[1]);
  const minNodeX = Math.min(...nodeXCoordinates);
  const maxNodeX = Math.max(...nodeXCoordinates);
  const xCoordinateRange = maxNodeX - minNodeX + 2;
  const minNodeY = Math.min(...nodeYCoordinates);
  const maxNodeY = Math.max(...nodeYCoordinates);
  const yCoordinateRange = maxNodeY - minNodeY + 2;

  const sharedCoordinateRange = Math.max(xCoordinateRange, yCoordinateRange);

  return (
    <div className="container mx-auto sm:px-6 lg:px-8 flex flex-col pb-8 w-full">
      <div
        className="flex flex-col justify-center align-middle transform"
        ref={svgParentRef}
      >
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
            {[...Array(sharedCoordinateRange)].map((_, i) => (
              <line
                x1={((i + 1) * svgSize) / sharedCoordinateRange}
                y1={0}
                x2={((i + 1) * svgSize) / sharedCoordinateRange}
                y2={svgSize}
                stroke={i === 0 ? "black" : "grey"}
                strokeWidth={i === 0 ? "2" : "0.5"}
                key={`vertical${i}`}
              />
            ))}
            {[...Array(sharedCoordinateRange)].map((_, i) => (
              <line
                x1={0}
                y1={svgSize - ((i + 1) * svgSize) / sharedCoordinateRange}
                x2={svgSize}
                y2={svgSize - ((i + 1) * svgSize) / sharedCoordinateRange}
                stroke={i === 0 ? "black" : "grey"}
                strokeWidth={i === 0 ? "2" : "0.5"}
                key={`horizontal${i}`}
              />
            ))}
          </g>
          {nodes.map((node) => (
            <g key={node.id}>
              {currentNodeIndex > nodes.indexOf(node) && (
                <>
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
                      closestNode && node.id === closestNode.id
                        ? "green"
                        : "black"
                    }
                    strokeWidth={
                      closestNode && node.id === closestNode?.id ? "2" : "0.5"
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
                    fill={node === closestNode ? "green" : "black"}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {calculateEuclidianDistance(node, targetNode).toFixed(2)}
                  </text>
                </>
              )}
              <circle
                cx={(node.vector[0] + 1) * (svgSize / sharedCoordinateRange)}
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
                  ((node.vector[1] + 1) * (svgSize / sharedCoordinateRange) -
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
          <g>
            <circle
              cx={
                (targetNode.vector[0] + 1) * (svgSize / sharedCoordinateRange)
              }
              cy={
                svgSize -
                (targetNode.vector[1] + 1) * (svgSize / sharedCoordinateRange)
              }
              r="10"
              stroke="black"
              strokeWidth="3"
              fill="yellow"
            />
            <text
              x={(targetNode.vector[0] + 1) * (svgSize / sharedCoordinateRange)}
              y={
                svgSize -
                (targetNode.vector[1] + 1) * (svgSize / sharedCoordinateRange)
              }
              fill="black"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {targetNode.id}
            </text>
            <text
              x={(targetNode.vector[0] + 1) * (svgSize / sharedCoordinateRange)}
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
      </div>
    </div>
  );
}
