import { scaleLinear } from "d3-scale";
import { select } from "d3-selection";
import { useCallback, useEffect, useRef, useState } from "react";
import { pointer } from "d3";
import { NavigableSmallWorld } from "../lib/navigable-small-world";
import { GraphNode } from "../lib/navigable-small-world/graph-node";
import {
  drawGrid,
  drawNode,
  drawLinesToNeighbors,
  drawNextStepInSearch,
} from "./DrawToGridHelpers";

export function DisplayNSWGraph() {
  const smallWorldRef = useRef<NavigableSmallWorld | undefined>();
  const [nodeCount, setNodeCount] = useState(0);
  const svgElementRef = useRef<SVGSVGElement | null>(null);
  const xScale = scaleLinear().domain([-1, 11]).range([0, 500]);
  const yScale = scaleLinear().domain([-1, 11]).range([500, 0]);
  const [searchNode, setSearchNode] = useState<GraphNode | undefined>(
    undefined
  );
  const generatorFunctionRef = useRef<
    | Generator<GraphNode | undefined, GraphNode[] | undefined, unknown>
    | undefined
  >();
  const [generatedVectors, setGeneratedVectors] = useState(new Set());
  const [mode, setMode] = useState<"ADD_GRAPH_NODE" | "ADD_SEARCH_NODE">(
    "ADD_GRAPH_NODE"
  );

  const addNode = useCallback(
    (x: number, y: number) => {
      const newGV = new Set(generatedVectors);
      newGV.add(`${x},${y}`);
      setGeneratedVectors(newGV);
      console.log("adding node at", x, y);
      const newNode = new GraphNode(nodeCount, [x, y]);
      smallWorldRef.current?.addNode(newNode);
      setNodeCount((nodeCount) => nodeCount + 1);
    },
    [setNodeCount, nodeCount, setGeneratedVectors, generatedVectors]
  );

  // initialize the graph
  useEffect(() => {
    if (!smallWorldRef.current) {
      smallWorldRef.current = new NavigableSmallWorld({ k: 1 });
    }
  }, [nodeCount]);

  // draw the x and y axis, as well as vertical and horizontal grid lines
  useEffect(() => {
    const svg = select(svgElementRef.current);
    drawGrid(svg, xScale, yScale);
    //mouse click event, not move
    svg.on("click", (event) => {
      var coords = pointer(event);
      // convert raw cords to insertable node
      // corrds[0], coords[1] need to be scaled, can go up to 500
      const x = Math.min(Math.max(Math.round(xScale.invert(coords[0])), 0), 10);
      const y = Math.min(Math.max(Math.round(yScale.invert(coords[1])), 0), 10);
      console.log(x, y);
      // round to nearest integer between 0 and 10
      // check mode
      if (mode === "ADD_GRAPH_NODE") {
        addNode(x, y);
      } else {
        const newNode = new GraphNode(nodeCount, [x, y]);
        setSearchNode(newNode);

        generatorFunctionRef.current =
          smallWorldRef.current?.searchSimilarNodesGenerator(
            new GraphNode(nodeCount, [x, y]),
            1
          );

        const svg = select(svgElementRef.current);

        // Remove previous search node
        if (searchNode) {
          svg.select(`#sn${searchNode.id}`).remove();
          svg.selectAll(`line[id^='gl${searchNode.id}-']`).remove();
        }

        // Plot new search mode
        svg.selectAll("g > circle").style("fill", "transparent");

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
      }
    });
  }, [setNodeCount, addNode, xScale, yScale]);

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
  }, [nodeCount]);

  return (
    <div className="container mx-auto sm:px-6 lg:px-8 flex flex-col py-4">
      <div className="flex flex-col justify-center align-middle">
        <svg
          ref={svgElementRef}
          width="500"
          height="500"
          className="mx-auto border-2 border-black"
        ></svg>
      </div>
      <div className="flex flex-col justify-center align-middle text-center">
        {mode === "ADD_GRAPH_NODE" ? (
          <div>Click the graph to add a new node to the graph</div>
        ) : (
          <div>
            Click on the graph to add a node at that location and start
            similarity search
          </div>
        )}
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
                  m === "ADD_GRAPH_NODE" ? "ADD_SEARCH_NODE" : "ADD_GRAPH_NODE"
                );
              }}
            >
              {mode === "ADD_GRAPH_NODE"
                ? "Currently adding Graph Nodes"
                : "Currently adding a node to start similarity search"}
            </button>
          )}
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => {
              smallWorldRef.current = new NavigableSmallWorld({ k: 1 });
              select(svgElementRef.current).selectAll("svg > *").remove();
              const svg = select(svgElementRef.current);
              drawGrid(svg, xScale, yScale);
              setGeneratedVectors(new Set());
              setNodeCount(0);
              setSearchNode(undefined);
              setMode("ADD_GRAPH_NODE");
              generatorFunctionRef.current = undefined;
            }}
          >
            Reset
          </button>
          <form
            className="flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            {searchNode && (
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={() => {
                  const generator = generatorFunctionRef.current;

                  const result = generator?.next();
                  const svg = select(svgElementRef.current);
                  drawNextStepInSearch(
                    svg,
                    searchNode,
                    result,
                    setSearchNode,
                    svgElementRef,
                    xScale,
                    yScale,
                    smallWorldRef
                  );
                }}
              >
                Next
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
