import { pointer } from "d3";
import { scaleLinear } from "d3-scale";
import { select } from "d3-selection";
import throttle from "lodash.throttle";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { NavigableSmallWorld } from "../lib/navigable-small-world";
import { GraphNode } from "../lib/navigable-small-world/graph-node";
import {
  clearGrid,
  drawGrid,
  drawLinesToNeighbors,
  drawNextStepInSearch,
  drawNode,
} from "./DrawToGridHelpers";

export function DisplayNSWGraph({ autoRun = false }: { autoRun?: boolean }) {
  const [svgSize, setSvgSize] = useState(500);
  const [nodeCount, setNodeCount] = useState(0);
  const [searchNode, setSearchNode] = useState<GraphNode | undefined>(
    undefined
  );
  const [generatedVectors, setGeneratedVectors] = useState(new Set());
  const [mode, setMode] = useState<
    "ADD_GRAPH_NODE" | "ADD_SEARCH_NODE" | "SEARCHING" | "SEARCH_COMPLETE"
  >("ADD_GRAPH_NODE");
  const [result, setResult] = useState<GraphNode[] | undefined>(undefined);
  const [isRunning, setIsRunning] = useState(autoRun);
  const [resetCountdown, setResetCountdown] = useState(5);

  const smallWorldRef = useRef<NavigableSmallWorld | undefined>();
  const svgElementRef = useRef<SVGSVGElement | null>(null);
  const svgParentRef = useRef<HTMLDivElement>(null);
  const generatorFunctionRef = useRef<
    | Generator<GraphNode | undefined, GraphNode[] | undefined, unknown>
    | undefined
  >();

  const xScale = useMemo(
    () => scaleLinear().domain([-1, 11]).range([0, svgSize]),
    [svgSize]
  );
  const yScale = useMemo(
    () => scaleLinear().domain([-1, 11]).range([svgSize, 0]),
    [svgSize]
  );

  const getSvgParentWidth = useCallback(() => {
    return svgParentRef.current ? svgParentRef.current.offsetWidth : 0;
  }, []);

  const addNode = useCallback(
    (x: number, y: number) => {
      if (generatedVectors.has(`${x},${y}`)) {
        console.warn(`node already exists at ${x},${y}`);
        return;
      }
      setGeneratedVectors((prevVectors) => {
        const newGV = new Set(prevVectors);
        newGV.add(`${x},${y}`);
        return newGV;
      });
      const newNode = new GraphNode(nodeCount, [x, y]);
      smallWorldRef.current?.addNode(newNode);
      setNodeCount((nodeCount) => nodeCount + 1);
    },
    [setNodeCount, nodeCount, generatedVectors]
  );

  const resetGraphState = useCallback(() => {
    smallWorldRef.current = new NavigableSmallWorld({ k: 1 });
    select(svgElementRef.current).selectAll("svg > *").remove();
    const svg = select(svgElementRef.current);
    drawGrid(svg, xScale, yScale);
    setGeneratedVectors(new Set());
    setNodeCount(0);
    setSearchNode(undefined);
    setMode("ADD_GRAPH_NODE");
    generatorFunctionRef.current = undefined;
    setResult(undefined);
  }, [
    setNodeCount,
    setGeneratedVectors,
    setSearchNode,
    setMode,
    setResult,
    xScale,
    yScale,
  ]);

  // Handle window resize event with throttle
  useEffect(() => {
    const handleWindowResize = throttle(() => {
      if (typeof window !== "undefined") {
        // Adjust SVG size based on window size, with a minimum of 100 and a maximum of 500
        setSvgSize(Math.min(Math.max(getSvgParentWidth(), 100), 500));
        // reset the svg graph completely
        resetGraphState();
        // clear svg completely below
        select(svgElementRef.current).selectAll("*").remove();
        // redraw grid
        const svg = select(svgElementRef.current);
        drawGrid(svg, xScale, yScale);
      }
    }, 200); // Throttle resize events to every 200ms

    if (typeof window !== "undefined") {
      // Add event listener for window resize
      window.addEventListener("resize", handleWindowResize);

      // Cleanup function to remove event listener
      return () => {
        window.removeEventListener("resize", handleWindowResize);
        handleWindowResize.cancel(); // Cancel any pending executions of handleWindowResize
      };
    }
  }, [
    setSvgSize,
    xScale,
    yScale,
    resetGraphState,
    setNodeCount,
    setGeneratedVectors,
    getSvgParentWidth,
  ]);

  useEffect(() => {
    if (isRunning) {
      const intervalId = setInterval(() => {
        if (mode === "ADD_GRAPH_NODE") {
          if (nodeCount < 8) {
            // Add 10 random nodes
            const x = Math.floor(Math.random() * 11);
            const y = Math.floor(Math.random() * 11);
            addNode(x, y);
          } else {
            setMode("SEARCHING");
            // Add one search node
            const searchX = Math.floor(Math.random() * 11);
            const searchY = Math.floor(Math.random() * 11);
            const searchNode = new GraphNode(nodeCount, [searchX, searchY]);
            setSearchNode(searchNode);
            // Run the search
            generatorFunctionRef.current =
              smallWorldRef.current?.searchSimilarNodesGenerator(searchNode, 1);
            const generator = generatorFunctionRef.current;

            const result = generator?.next();
            const svg = select(svgElementRef.current);
            drawNextStepInSearch(
              svg,
              searchNode,
              result,
              svgElementRef,
              xScale,
              yScale,
              smallWorldRef
            );
            if (result?.done) {
              setResult(result.value);
              setMode("SEARCH_COMPLETE");
              setSearchNode(undefined);
            }
          }
        } else if (mode === "SEARCHING" && searchNode) {
          // Run the search
          const generator = generatorFunctionRef.current;

          const result = generator?.next();
          const svg = select(svgElementRef.current);
          drawNextStepInSearch(
            svg,
            searchNode,
            result,
            svgElementRef,
            xScale,
            yScale,
            smallWorldRef
          );
          if (result?.done) {
            setResult(result.value);
            setMode("SEARCH_COMPLETE");
            setSearchNode(undefined);
            setResetCountdown(5);
          }
        } else if (mode === "SEARCH_COMPLETE") {
          if (resetCountdown > 1) {
            setResetCountdown((countdown) => countdown - 1);
          } else {
            resetGraphState();
          }
        }
      }, 1000);

      // Cleanup function to clear the interval
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [
    isRunning,
    addNode,
    nodeCount,
    setMode,
    mode,
    searchNode,
    xScale,
    yScale,
    setResetCountdown,
    resetCountdown,
    resetGraphState,
  ]);

  // initialize the graph
  useEffect(() => {
    if (!smallWorldRef.current) {
      smallWorldRef.current = new NavigableSmallWorld({ k: 1 });
      setSvgSize(Math.min(Math.max(getSvgParentWidth(), 100), 500));
    }
  }, [nodeCount, setNodeCount, getSvgParentWidth]);

  // handle clearing grid and redrawing grid on resize
  useEffect(() => {
    // Redraw the grid
    const svg = select(svgElementRef.current);
    clearGrid(svg);
    drawGrid(svg, xScale, yScale);
  }, [svgSize, xScale, yScale]);

  // handle drawing nodes and lines on grid, add click event handler
  useEffect(() => {
    const svg = select(svgElementRef.current);
    drawGrid(svg, xScale, yScale);
    //mouse click event, not move
    svg.on("click", (event) => {
      if (isRunning) {
        return;
      }
      var coords = pointer(event);
      // convert raw cords to insertable node
      // corrds[0], coords[1] need to be scaled, can go up to 500
      const x = Math.min(Math.max(Math.round(xScale.invert(coords[0])), 0), 10);
      const y = Math.min(Math.max(Math.round(yScale.invert(coords[1])), 0), 10);
      // round to nearest integer between 0 and 10
      // check mode
      if (mode === "ADD_GRAPH_NODE") {
        addNode(x, y);
      } else if (mode === "ADD_SEARCH_NODE" || mode === "SEARCH_COMPLETE") {
        const newNode = new GraphNode(nodeCount, [x, y]);
        setSearchNode(newNode);

        generatorFunctionRef.current =
          smallWorldRef.current?.searchSimilarNodesGenerator(
            new GraphNode(nodeCount, [x, y]),
            1
          );

        const svg = select(svgElementRef.current);

        // Remove previous search node
        svg.selectAll("g[id^='sn']").remove();
        // Reset all widths to 1 on all nodes
        svg
          .selectAll("g > circle")
          .style("fill", "transparent")
          .style("stroke-width", 1);
        // Plot new search mode

        const group = svg.append("g");
        group.attr("id", `sn${newNode.id}`);
        group
          .append("circle")
          .attr("cx", xScale(newNode.vector[0]))
          .attr("cy", yScale(newNode.vector[1]))
          .attr("r", 10)
          .style("stroke", "black")
          .style("fill", "blue");

        group
          .append("text")
          .attr("x", xScale(newNode.vector[0]))
          .attr("y", yScale(newNode.vector[1]) + 20) // position the text 15px below the node
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "central")
          .style("fill", "black")
          .text(`(${newNode.vector[0]}, ${newNode.vector[1]})`); // print the node's coordinates

        // clear last set of nearest neighbors w rad 13
        svg.selectAll("g > circle").style("stroke-width", 1).attr("r", 10);

        setMode("SEARCHING");
      }
    });
  }, [
    mode,
    nodeCount,
    setNodeCount,
    addNode,
    xScale,
    yScale,
    setSvgSize,
    getSvgParentWidth,
    isRunning,
  ]);

  useEffect(() => {
    const svg = select(svgElementRef.current);

    const graphNodes = smallWorldRef.current?.graph.getNodes();

    if (!graphNodes) {
      return;
    }

    const [last] = graphNodes?.slice(-1);
    graphNodes?.forEach((node) => {
      drawNode(svg, node, last, xScale, yScale);
      const neighbors = smallWorldRef.current?.graph.getNeighborsForNode(node);
      if (neighbors) {
        drawLinesToNeighbors(svg, node, neighbors, xScale, yScale);
      }
    });
  }, [nodeCount, xScale, yScale]);

  return (
    <div className="container mx-auto sm:px-6 lg:px-8 flex flex-col py-4 text-xs sm:text-sm">
      <div
        className="flex flex-col justify-center align-middle"
        ref={svgParentRef}
      >
        <svg
          ref={svgElementRef}
          width={svgSize}
          height={svgSize}
          preserveAspectRatio="xMidYMid meet"
          className={`mx-auto border-2 border-black ${isRunning ? "cursor-default" : "cursor-pointer"}`}
          style={{ width: svgSize, height: svgSize }}
        ></svg>
      </div>
      {!isRunning ? (
        <div className="flex flex-col justify-center align-middle text-center">
          {(() => {
            switch (mode) {
              case "ADD_GRAPH_NODE":
                return "Building Graph: Click the graph to add a new node to the graph. Once you have added at least 2 nodes, you can start the similarity search by clicking the button below.";
              case "ADD_SEARCH_NODE":
                return "Adding Search Node: Click on the graph to add a node to search for";
              case "SEARCHING":
                return `Searching for node at (${searchNode?.vector[0]},${searchNode?.vector[1]}). Click next to continue the search`;
              case "SEARCH_COMPLETE":
                return `Search Complete: Closest nodes are ${result?.map(
                  (n) => `node ${n.id} at (${n.vector[0]},${n.vector[1]})`
                )}
                  `;
              default:
                return "Adding Search Node";
            }
          })()}
          <div className="flex flex-row gap-4 justify-center align-middle">
            {!searchNode && (
              <button
                className={`${
                  mode === "ADD_GRAPH_NODE"
                    ? "bg-blue-500 hover:bg-blue-700"
                    : "bg-orange-500 hover:bg-orange-700"
                } text-white font-bold py-2 px-4 rounded`}
                onClick={() => {
                  setMode((m) =>
                    m === "ADD_GRAPH_NODE"
                      ? "ADD_SEARCH_NODE"
                      : "ADD_GRAPH_NODE"
                  );
                }}
              >
                {mode === "ADD_GRAPH_NODE"
                  ? nodeCount < 2
                    ? "Add at least 2 nodes to start similarity search"
                    : "Click to start similarity search"
                  : "Click to add more nodes to the graph"}
              </button>
            )}
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={resetGraphState}
            >
              Reset
            </button>
            {mode === "SEARCHING" && searchNode && (
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={() => {
                  const generator = generatorFunctionRef.current;

                  const result = generator?.next();
                  const svg = select(svgElementRef.current);
                  drawNextStepInSearch(
                    svg,
                    searchNode,
                    result,
                    svgElementRef,
                    xScale,
                    yScale,
                    smallWorldRef
                  );
                  if (result?.done) {
                    setResult(result.value);
                    setMode("SEARCH_COMPLETE");
                    setSearchNode(undefined);
                  }
                }}
              >
                Next
              </button>
            )}
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => {
                setIsRunning(true);
              }}
            >
              Start Auto-Run
            </button>
          </div>
        </div>
      ) : (
        // toggle running button
        <div className="flex flex-col justify-center align-middle text-center ">
          {(() => {
            switch (mode) {
              case "ADD_GRAPH_NODE":
                return "Building Graph: adding new nodes to the graph.";
              case "ADD_SEARCH_NODE":
                return "Adding Search Node: Search node added";
              case "SEARCHING":
                return `Searching for node at (${searchNode?.vector[0]},${searchNode?.vector[1]}).`;
              case "SEARCH_COMPLETE":
                return `Search Complete: Closest nodes are ${result?.map(
                  (n) => `node ${n.id} at (${n.vector[0]},${n.vector[1]})`
                )}. Resetting in ${resetCountdown} seconds.
                  `;
              default:
                return "Adding Search Node";
            }
          })()}
          <div className="flex flex-row gap-4 justify-center align-middle">
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => {
                setIsRunning(false);
              }}
            >
              Stop Auto-Run
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
