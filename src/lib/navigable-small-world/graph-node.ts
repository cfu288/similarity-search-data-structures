// for simplicity, we will use a 2D vector for easy plotting

export class GraphNode {
  public id: number;
  public vector: [number, number];

  constructor(id: number, vector: [number, number]) {
    this.id = id;
    this.vector = vector;
  }
}
