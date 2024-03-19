import { type ScaleLinear } from "d3-scale";
import { select, type Selection } from "d3-selection";
import { axisBottom, axisLeft } from "d3";
import { NavigableSmallWorld } from "../lib/navigable-small-world";
import { GraphNode } from "../lib/navigable-small-world/graph-node";
import { calculateEuclidianDistance } from "../lib/navigable-small-world/helpers";

export function drawNode(
  svg: Selection<SVGSVGElement | null, unknown, null, undefined>,
  node: GraphNode,
  last: GraphNode,
  xScale: ScaleLinear<number, number, never>,
  yScale: ScaleLinear<number, number, never>
) {
  let group = svg.select(`g#n${node.id}`);
  if (group.empty()) {
    group = svg.append("g");
    group.attr("id", `n${node.id}`);
  }

  group
    .selectAll("g")
    .data([node], (d) => d.id)
    .join(
      (enter) => {
        const g = enter.append("g");
        g.append("circle")
          .attr("cx", (d) => xScale(d.vector[0]))
          .attr("cy", (d) => yScale(d.vector[1]))
          .attr("r", 10)
          .style("stroke", "black")
          .style("fill", (d) => (d.id === last.id ? "red" : "transparent"));

        g.append("text")
          .attr("x", (d) => xScale(d.vector[0]))
          .attr("y", (d) => yScale(d.vector[1]))
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "central")
          .style("fill", "black")
          .text((d) => d.id);

        g.append("text")
          .attr("id", `coord${node.id}`) // give a different id
          .attr("x", () => xScale(node.vector[0]))
          .attr("y", () => yScale(node.vector[1]) + 20) // position the text 15px below the node
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "central")
          .style("fill", "black")
          .text(() => `(${node.vector[0]}, ${node.vector[1]})`); // print the node's coordinates
      },
      (update) => {
        update
          .select("circle")
          .attr("cx", (d) => xScale(d.vector[0]))
          .attr("cy", (d) => yScale(d.vector[1]))
          .transition()
          .style("fill", (d) => (d.id === last.id ? "red" : "transparent"));

        update
          .select("text")
          .attr("x", (d) => xScale(d.vector[0]))
          .attr("y", (d) => yScale(d.vector[1]))
          .text((d) => d.id);
      },
      (exit) => exit.remove()
    );
}
export function drawLinesToNeighbors(
  svg: Selection<SVGSVGElement | null, unknown, null, undefined>,
  node: GraphNode,
  neighbors: GraphNode[],
  xScale: ScaleLinear<number, number, never>,
  yScale: ScaleLinear<number, number, never>
) {
  neighbors.forEach((neighbor) => {
    const line = svg
      .append("line")
      .attr("x1", xScale(node.vector[0]))
      .attr("y1", yScale(node.vector[1]))
      .attr("x2", xScale(neighbor.vector[0]))
      .attr("y2", yScale(neighbor.vector[1]))
      .style("stroke", "black");

    const distance = calculateEuclidianDistance(neighbor, node);

    const midX = (node.vector[0] + neighbor.vector[0]) / 2;
    const midY = (node.vector[1] + neighbor.vector[1]) / 2;

    const distanceText = svg
      .append("text")
      .attr("x", xScale(midX))
      .attr("y", yScale(midY))
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .style("fill", "black")
      .style("opacity", 0)
      .text(distance.toFixed(2));

    line.on("mouseover", function () {
      distanceText.transition().duration(50).style("opacity", 1);
    });

    line.on("mouseout", function () {
      distanceText.transition().duration(50).style("opacity", 0.1);
    });

    distanceText.on("mouseover", function () {
      distanceText.transition().duration(50).style("opacity", 1);
    });

    distanceText.on("mouseout", function () {
      distanceText.transition().duration(50).style("opacity", 0.1);
    });
  });
}
export function drawGrid(
  svg: Selection<SVGSVGElement | null, unknown, null, undefined>,
  xScale: ScaleLinear<number, number, never>,
  yScale: ScaleLinear<number, number, never>
) {
  if (!svg.select("#grid").empty()) {
    return;
  }

  const xAxis = svg
    .append("g")
    .attr("transform", "translate(0, 500)")
    .attr("id", "grid");
  const yAxis = svg
    .append("g")
    .attr("transform", "translate(0, 0)")
    .attr("id", "grid");
  const xGridLines = svg.append("g").attr("id", "grid");
  const yGridLines = svg.append("g").attr("id", "grid");

  xAxis.call(axisBottom(xScale));
  yAxis.call(axisLeft(yScale));

  xGridLines
    .selectAll("line")
    .data(xScale.ticks(10))
    .join("line")
    .attr("x1", (d) => xScale(d))
    .attr("x2", (d) => xScale(d))
    .attr("y1", 0)
    .attr("y2", 500)
    .attr("stroke", "grey")
    .attr("stroke-width", 0.5);

  yGridLines
    .selectAll("line")
    .data(yScale.ticks(10))
    .join("line")
    .attr("x1", 0)
    .attr("x2", 500)
    .attr("y1", (d) => yScale(d))
    .attr("y2", (d) => yScale(d))
    .attr("stroke", "grey")
    .attr("stroke-width", 0.5);

  xGridLines
    .selectAll("text")
    .data(xScale.ticks(10))
    .join("text")
    .attr("x", (d) => xScale(d))
    .attr("y", 0)
    .attr("dy", "-0.5em")
    .attr("text-anchor", "middle")
    .text((d) => d);
}
export function drawNextStepInSearch(
  svg: Selection<SVGSVGElement | null, unknown, null, undefined>,
  searchNode: GraphNode,
  result:
    | IteratorResult<GraphNode | undefined, GraphNode[] | undefined>
    | undefined,
  setSearchNode: (node: GraphNode | undefined) => void,
  svgElementRef: React.MutableRefObject<SVGSVGElement | null>,
  xScale: ScaleLinear<number, number, never>,
  yScale: ScaleLinear<number, number, never>,
  smallWorldRef: React.MutableRefObject<NavigableSmallWorld | undefined>
) {
  svg.selectAll("g > circle").style("fill", "transparent");
  // make all lines not green
  svg.selectAll("line").style("stroke", "black");
  // remove all lines that are green with id gl<searchNode.id>-<neighbor.id>
  svg.selectAll(`line[id^='gl${searchNode.id}-']`).remove();
  // remove all text that are green with id gt<searchNode.id>-<neighbor.id>
  svg.selectAll(`text[id^='gt${searchNode.id}-']`).remove();
  // mark the search node in blue
  const group = svg.select(`g#sn${searchNode.id}`);
  group.select("circle").style("fill", "blue");

  if (result?.done) {
    setSearchNode(undefined);
    //get the return value of the generator
    const nodes = result?.value;
    console.log("nodes", nodes);
    // highlight the nodes in yellow
    nodes?.forEach((node) => {
      const group = svg.select(`g#n${node.id}`);
      group.select("circle").style("fill", "yellow");
    });
  } else {
    const node = result?.value;
    console.log("node", node);
    if (node) {
      // Plot the node on the graph
      const svg = select(svgElementRef.current);
      const group = svg.append("g");
      group.attr("id", `n${node.id}`);
      group
        .append("circle")
        .attr("cx", xScale(node.vector[0]))
        .attr("cy", yScale(node.vector[1]))
        .attr("r", 10)
        .style("stroke", "black")
        .style("fill", "green");

      // get neighbors of the node, we're going to draw lines to them from the current search node in green
      const neighbors = smallWorldRef.current?.graph.getNeighborsForNode(node);
      if (neighbors) {
        [...neighbors, node]?.forEach((neighbor) => {
          svg
            .append("line")
            .attr("id", `gl${searchNode.id}-${neighbor.id}`)
            .attr("x1", xScale(searchNode.vector[0]))
            .attr("y1", yScale(searchNode.vector[1]))
            .attr("x2", xScale(neighbor.vector[0]))
            .attr("y2", yScale(neighbor.vector[1]))
            .style("stroke", "green");
        });

        // get the distance to the search node and its neighbors
        const distances = [node, ...neighbors].map((neighbor) => {
          const distance = calculateEuclidianDistance(searchNode, neighbor);
          const lineMiddleX =
            (xScale(searchNode.vector[0]) + xScale(neighbor.vector[0])) / 2;
          const lineMiddleY =
            (yScale(searchNode.vector[1]) + yScale(neighbor.vector[1])) / 2;
          return {
            id: neighbor.id,
            distance,
            lineMiddleX,
            lineMiddleY,
          };
        });

        distances.forEach(({ id, distance, lineMiddleX, lineMiddleY }) => {
          svg
            .selectAll(`text#gt${searchNode.id}-${id}`)
            .data([id], (d) => d)
            .join(
              (enter) =>
                enter
                  .append("text")
                  .attr("id", `gt${searchNode.id}-${id}`)
                  .attr("x", lineMiddleX)
                  .attr("y", lineMiddleY)
                  .attr("text-anchor", "middle")
                  .attr("dominant-baseline", "central")
                  .style("fill", "black")
                  .text(distance.toFixed(2)),
              (update) =>
                update
                  .attr("x", lineMiddleX)
                  .attr("y", lineMiddleY)
                  .text(distance.toFixed(2)),
              (exit) => exit.remove()
            );
        });
      }
    }
  }
}
