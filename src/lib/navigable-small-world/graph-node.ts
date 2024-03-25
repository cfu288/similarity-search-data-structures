// for simplicity, we will use a 2D vector for easy plotting

export class GraphNode {
  public id: number;
  public vector: [number, number];

  constructor(id: number, vector: [number, number]) {
    this.id = id;
    this.vector = vector;
  }

  /**
   * Serializes the GraphNode object into a JSON string.
   *
   * @returns {string} The serialized GraphNode object.
   *
   * @example
   * const node = new GraphNode(1, [2, 3]);
   * const serializedNode = node.serialize();
   * console.log(serializedNode); // Outputs: '{"id":1,"vector":[2,3]}'
   */
  serialize(): string {
    return JSON.stringify(this);
  }

  /**
   * Deserializes a JSON string into a GraphNode object.
   *
   * @param {string} jsonString - The JSON string to deserialize.
   * @returns {GraphNode} The deserialized GraphNode object.
   *
   * @example
   * const jsonString = '{"id":1,"vector":[2,3]}';
   * const node = GraphNode.deserialize(jsonString);
   * console.log(node); // Outputs: GraphNode { id: 1, vector: [ 2, 3 ] }
   */
  static deserialize(jsonString: string): GraphNode {
    const obj = JSON.parse(jsonString);
    return new GraphNode(obj.id, obj.vector);
  }
}
