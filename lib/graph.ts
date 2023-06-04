import { CircleReceiver, Edge } from './types';

export {};

export class ImmutableQueue<T> {
  #arr: Array<T>;

  constructor(arr: T[]) {
    this.#arr = arr;
  }
  enqueue(item: T) {
    return new ImmutableQueue([item].concat(this.#arr));
  }

  dequeue() {
    return {
      poppedItem: this.#arr.at(-1),
      newQueue: new ImmutableQueue(this.#arr.slice(0, -1)),
    };
  }

  [Symbol.iterator]() {
    let index = 0;
    let data = this.#arr;

    return {
      next: () => {
        return {
          value: data[index],
          done: index++ >= data.length,
        };
      },
    };
  }

  size() {
    return this.#arr.length;
  }

  toString() {
    return `[${this.#arr.join(',')}]`;
  }
}

export class ImmutableSet<T> {
  #mutSet: Set<T>;
  constructor(arr: T[]) {
    this.#mutSet = new Set(arr);
  }
  add(item: T) {
    return new ImmutableSet<T>([...this.#mutSet.add(item).keys()]);
  }

  delete(item: T) {
    this.#mutSet.delete(item);
    return new ImmutableQueue<T>([...this.#mutSet.keys()]);
  }

  has(item: T) {
    return this.#mutSet.has(item);
  }

  toString() {
    return `[${[...this.#mutSet.keys()].join(',')}]`;
  }
}

export const buildNaiveAdjacencyList = (vertices: CircleReceiver[]) => {
  const adjList = new Map<string, string[]>();

  vertices.forEach((v) => {
    adjList.set(v.id, v.nodeReceiver.attachedIds);
  });

  return adjList;
};

export const getAdjacencyList = ({
  vertices,
  edges,
}: {
  vertices: CircleReceiver[];
  edges: Edge[];
}) => {
  // given vertices and attach node id
  // generate the adjacency list with the helper func
  // that gives us all the attached nodes to the reciever
  // need to map that id to the opposing vertices to show a neighbor connection
  // need to get the edges from the attach node
  // need to get the opposite attach nodes
  // need to find the circle that its connected to the opposite attach node
  // need to return the circles

  // need to make these ids to their actual's
  const brokenAdjacencyList = vertices.reduce<string[]>((prev, curr) => {
    return [...prev, ...curr.nodeReceiver.attachedIds];
  }, []);

  const idMap = new Map<string, string>();

  brokenAdjacencyList.forEach((id) => {
    // looking for the container edge for this node
    const containerEdge = edges.find(
      (edge) => edge.attachNodeOne.id === id || edge.attachNodeTwo.id === id
    );
    if (!containerEdge) {
      throw new Error(`You have some id in this array that doesn't make sense`);
    }
    // Because we are looking for the opposite connector on the edge
    const opposingNode =
      containerEdge.attachNodeOne.id === id
        ? containerEdge.attachNodeTwo
        : containerEdge.attachNodeOne;

    const neighbor = vertices.find((v) =>
      v.nodeReceiver.attachedIds.includes(opposingNode.id)
    );

    if (neighbor) {
      idMap.set(id, neighbor.id);
    }
  });

  const correctVerticesList = vertices.map((v) => {
    const newV: CircleReceiver = {
      ...v,
      nodeReceiver: {
        ...v.nodeReceiver,
        attachedIds: v.nodeReceiver.attachedIds.reduce<string[]>(
          (prev, curr) => {
            const newId = idMap.get(curr);
            if (newId) {
              return [...prev, newId];
            }
            return prev;
          },
          []
        ),
      },
    };
    return newV;
  });

  return buildNaiveAdjacencyList(correctVerticesList);
};
