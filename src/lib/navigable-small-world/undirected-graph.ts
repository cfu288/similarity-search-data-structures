import { GraphNode } from "./graph-node";

// use neighbor dict to store the edges
// neighbor dictionary is directed (asymmetric), so we need to duplicate connections
//add a new entry to the dictionary when a new
//node is added, append to an existing entry when
//an existing node is connected to
export class UndirectedGraph {
  public neighbor_dict: {
    [key: string]: {
      node: GraphNode;
      neighbors: Array<GraphNode>;
    };
  } = {};

  // serializes neighbor_dict to a string, later can be used to deserialize it back to a graph
  // GraphNodes can be serialized and deserialized using their own methods serialize() and deserialize()
  public serialize(): string {
    let serialized: Record<string, {node: string, neighbors: string[]}> = {};
    for (const key in this.neighbor_dict) {
      serialized[key] = {
        node: this.neighbor_dict[key].node.serialize(),
        neighbors: this.neighbor_dict[key].neighbors.map((n) => n.serialize()),
      };
    }
    return JSON.stringify(serialized);
  }

  // deserializes a string back to a graph
  public static deserialize(jsonString: string): UndirectedGraph {
    let obj = JSON.parse(jsonString);
    let graph = new UndirectedGraph();
    for (const key in obj) {
      let node = GraphNode.deserialize(obj[key].node);
      graph.neighbor_dict[key] = {
        node: node,
        neighbors: obj[key].neighbors.map((n: string) => GraphNode.deserialize(n)),
      };
    }
    return graph;
  }

  public addNode(node: GraphNode): void {
    if (!(node.id in this.neighbor_dict)) {
      this.neighbor_dict[node.id] = {
        node: node,
        neighbors: [],
      };
    }
  }

  public addEdge(node1: GraphNode, node2: GraphNode): void {
    this.addNode(node1);
    this.addNode(node2);
    if (!this.hasEdge(node1, node2)) {
      this.neighbor_dict[node1.id].neighbors.push(node2);
      this.neighbor_dict[node2.id].neighbors.push(node1);
    }
  }

  public hasEdge(node1: GraphNode, node2: GraphNode): boolean {
    return this.neighbor_dict[node1.id].neighbors.some(
      (node) => node.id === node2.id
    );
  }

  public getNode(node: GraphNode): GraphNode {
    return this.neighbor_dict[node.id]?.node;
  }

  public getNodes(): GraphNode[] {
    return Object.keys(this.neighbor_dict).map((key) => {
      return this.neighbor_dict[key].node;
    });
  }

  public getNodeById(id: number): GraphNode {
    return this.neighbor_dict[id]?.node;
  }

  public getNeighborsForNode(node: GraphNode): GraphNode[] {
    if (!node) {
      throw new Error("Node is undefined");
    }
    return this.neighbor_dict[node.id].neighbors;
  }

  public getStartNode(): GraphNode | undefined {
    return Object.values(this.neighbor_dict)[0].node;
  }

  public toPrettyString(): string {
    let graphRepresentation = "";
    for (const key in this.neighbor_dict) {
      const node = this.neighbor_dict[key].node;
      const neighbors = this.neighbor_dict[key].neighbors;
      graphRepresentation += `Node ${node.id}: `;
      for (const neighbor of neighbors) {
        graphRepresentation += `${neighbor.id}, `;
      }
      graphRepresentation = graphRepresentation.slice(0, -2); // remove trailing comma and space
      graphRepresentation += "\n";
    }
    return graphRepresentation;
  }
}
