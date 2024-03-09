import { GraphNode } from "./graph-node";

export function calculateEuclidianDistance(node1: GraphNode, node2: GraphNode) {
  let distA = Math.hypot(
    node1.vector[0] - node2.vector[0],
    node1.vector[1] - node2.vector[1]
  );

  return distA;
}
