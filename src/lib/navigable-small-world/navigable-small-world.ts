import { PriorityQueue } from "./priority-queue";
import { GraphNode } from "./graph-node";
import { UndirectedGraph } from "./undirected-graph";
import { calculateEuclidianDistance } from "./helpers";

export class NavigableSmallWorld {
  public k: number; // number of neighbors to connect to
  graph: UndirectedGraph;

  constructor({ k = 2 }: { k: number }) {
    this.k = k;
    this.graph = new UndirectedGraph();
  }

  /**
   * This method is used to insert a node into the graph and connect it to K nearest neighbors.
   * The search of the nearest neighbors uses a greedy search algorithm and calculation of euclidean
   * distance between the node to insert and each node it transverses with.
   *
   * @param nodeToAdd - The node to be added to the graph.
   * @returns The node that was added to the graph.
   */
  public addNode(nodeToAdd: GraphNode): GraphNode {
    console.log(`Starting to add node ${nodeToAdd.id} to the graph`);
    let visitedNodes: Set<number> = new Set();

    // Initialize a priority queue to store nodes and their distances
    let visitedNeighbors = new PriorityQueue<{
      distance: number;
      node?: GraphNode;
    }>({
      comparator: (a, b) => a.distance - b.distance,
    });

    // If the graph is not empty, add the first node in the graph to the priority queue
    if (Object.entries(this.graph.neighbor_dict).length !== 0) {
      const firstNode = Object.values(this.graph.neighbor_dict)[0]
        .node as GraphNode;
      visitedNeighbors.push({
        distance: calculateEuclidianDistance(nodeToAdd, firstNode),
        node: firstNode,
      });
      visitedNodes.add(firstNode.id);
    } else {
      // If the graph is empty, add the node and return it
      // console.log("graph is empty, adding node", nodeToAdd.id, "\n");
      this.graph.addNode(nodeToAdd);
      return this.graph.getNode(nodeToAdd);
    }

    // Iterate through all neighbors to find the closest one
    while (true) {
      // Pop the node with the smallest distance from the priority queue
      const next = visitedNeighbors.peek()!;
      // console.log(
      //   "Currently at node",
      //   next?.node?.id,
      //   "with neighbors:",
      //   this.graph.getNeighborsForNode(next.node!)
      // );
      // console.log(
      //   "distance between",
      //   nodeToAdd.id,
      //   "and current node",
      //   next.node?.id,
      //   "is",
      //   next.distance
      // );

      // Get the neighbors of the popped node
      const neighbors = this.graph.getNeighborsForNode(next.node!);

      // For each neighbor, calculate the Euclidean distance to the new node and add it to the priority queue
      let allDistancesGreaterThanPopped = true;
      for (const neighbor of neighbors) {
        if (!visitedNodes.has(neighbor.id)) {
          const distance = calculateEuclidianDistance(nodeToAdd, neighbor);
          if (distance < next.distance) {
            allDistancesGreaterThanPopped = false;
            // console.log(
            //   "new smallest distance found between",
            //   nodeToAdd.id,
            //   "and",
            //   neighbor.id,
            //   "at",
            //   distance
            // );
          }
          visitedNeighbors.push({
            distance: distance,
            node: neighbor,
          });
          visitedNodes.add(neighbor.id);
        }
      }

      // If all distances for the nodeToAdd to the current neighbors are greater than the distance of nodeToAdd to the current node, insert the nodeToAdd here and add closest edges as neighbors
      if (allDistancesGreaterThanPopped) {
        this.graph.addNode(nodeToAdd);
        const kClosestNeighbors = visitedNeighbors.popN(this.k);
        for (const i of kClosestNeighbors) {
          if (i.node) {
            this.graph.addEdge(nodeToAdd, i.node);
          }
        }
        console.log(
          "inserting node",
          nodeToAdd.id,
          "at",
          next.node?.id,
          "with neighbors",
          kClosestNeighbors,
          "\n"
        );
        return this.graph.getNode(nodeToAdd);
      }
    }
  }

  /**
   * This method is used to search the graph for the k nearest neighbors for a provided node.
   *
   * It uses a greedy search algorithm to traverse the graph, always selecting the next neighbor
   * with the smallest Euclidean distance to the provided node.
   *
   * Early stopping is used to stop the search if a local minimum is found where
   * all distances from the node to add to to all the neighbors of the current node
   * are greater than the distance to the current node itself. This means that the
   * result may be approximate, but it is guaranteed to be a local minimum.
   * @param node
   * @param k
   * @returns
   */
  public searchSimilarNodes(node: GraphNode, k: number): GraphNode[] {
    let visitedNodes: Set<number> = new Set();

    // Initialize a priority queue to store nodes and their distances
    let visitedNeighbors = new PriorityQueue<{
      distance: number;
      node?: GraphNode;
    }>({
      comparator: (a, b) => a.distance - b.distance,
    });

    // If the graph is not empty, add the first node in the graph to the priority queue
    if (Object.entries(this.graph.neighbor_dict).length !== 0) {
      const firstNode = Object.values(this.graph.neighbor_dict)[0]
        .node as GraphNode;
      visitedNeighbors.push({
        distance: calculateEuclidianDistance(node, firstNode),
        node: firstNode,
      });
      visitedNodes.add(firstNode.id);
    } else {
      // If the graph is empty, return an empty array
      return [];
    }

    // Iterate through all neighbors to find the closest one
    while (true) {
      // Pop the node with the smallest distance from the priority queue
      const next = visitedNeighbors.pop();
      console.log(
        "Currently at node",
        next?.node?.id,
        "with neighbors:",
        this.graph.getNeighborsForNode(next?.node!)
      );
      if (!next) {
        break;
      }

      // Get the neighbors of the popped node
      const neighbors = this.graph.getNeighborsForNode(next.node!);

      // For each neighbor, calculate the Euclidean distance to the new node and add it to the priority queue
      let allDistancesGreaterThanPopped = true;
      for (const neighbor of neighbors) {
        if (!visitedNodes.has(neighbor.id)) {
          const distance = calculateEuclidianDistance(node, neighbor);
          console.log(
            "distance between",
            node.id,
            "and current node",
            neighbor.id,
            "is",
            distance
          );
          if (distance < next.distance) {
            console.log(
              "new smallest distance found between",
              node.id,
              "and",
              neighbor.id,
              "at",
              distance
            );
            allDistancesGreaterThanPopped = false;
          }
          visitedNeighbors.push({
            distance: distance,
            node: neighbor,
          });
          visitedNodes.add(neighbor.id);
        }
      }
      if (allDistancesGreaterThanPopped) {
        console.log(
          "all distances with current neighbors greater than popped, stopping search at",
          next.node?.id
        );

        // Include the current closest node in the list of k closest neighbors
        const kClosestNeighbors = [next, ...visitedNeighbors.popN(k - 1)];
        console.log(
          "closest nodes with distances",
          kClosestNeighbors.map((i) => JSON.stringify(i)).join(", ")
        );
        return kClosestNeighbors.map((i) => i.node as GraphNode);
      }
    }
    return [];
  }

  public *searchSimilarNodesGenerator(node: GraphNode, k: number) {
    let visitedNodes: Set<number> = new Set();

    // Initialize a priority queue to store nodes and their distances
    let visitedNeighbors = new PriorityQueue<{
      distance: number;
      node?: GraphNode;
    }>({
      comparator: (a, b) => a.distance - b.distance,
    });

    // If the graph is not empty, add the first node in the graph to the priority queue
    if (Object.entries(this.graph.neighbor_dict).length !== 0) {
      const firstNode = Object.values(this.graph.neighbor_dict)[0]
        .node as GraphNode;
      visitedNeighbors.push({
        distance: calculateEuclidianDistance(node, firstNode),
        node: firstNode,
      });
      visitedNodes.add(firstNode.id);
    } else {
      // If the graph is empty, return an empty array
      return [];
    }

    // Iterate through all neighbors to find the closest one
    while (true) {
      // Pop the node with the smallest distance from the priority queue
      const next = visitedNeighbors.pop();
      yield next?.node; // Yield the current node being traversed

      if (!next) {
        break;
      }

      // Get the neighbors of the popped node
      const neighbors = this.graph.getNeighborsForNode(next.node!);

      // For each neighbor, calculate the Euclidean distance to the new node and add it to the priority queue
      let allDistancesGreaterThanPopped = true;
      for (const neighbor of neighbors) {
        if (!visitedNodes.has(neighbor.id)) {
          const distance = calculateEuclidianDistance(node, neighbor);
          if (distance < next.distance) {
            allDistancesGreaterThanPopped = false;
          }
          visitedNeighbors.push({
            distance: distance,
            node: neighbor,
          });
          visitedNodes.add(neighbor.id);
        }
      }
      if (allDistancesGreaterThanPopped) {
        // Include the current closest node in the list of k closest neighbors
        const kClosestNeighbors = [next, ...visitedNeighbors.popN(k - 1)];
        return kClosestNeighbors.map((i) => i.node as GraphNode);
      }
    }
  }

  toString() {
    return JSON.stringify(this.graph.neighbor_dict, null, 2);
  }
}

// generate example graph
const graph = new NavigableSmallWorld({ k: 2 });
const node1 = new GraphNode(1, [1, 1]);
const node2 = new GraphNode(2, [2, 2]);
const node3 = new GraphNode(3, [3, 3]);
const node4 = new GraphNode(4, [1, 4]);
const node5 = new GraphNode(5, [2, 5]);
const node6 = new GraphNode(6, [10, 5]);
const node7 = new GraphNode(7, [1, 2]);
graph.addNode(node1);
graph.addNode(node2);
graph.addNode(node3);
graph.addNode(node4);
graph.addNode(node5);
graph.addNode(node6);
graph.addNode(node7);

console.log(graph.searchSimilarNodes(new GraphNode(8, [10, 5]), 4));

console.log(graph.graph.toPrettyString());
