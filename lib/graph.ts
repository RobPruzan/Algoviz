import { CircleReceiver } from './types';

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
}

export const buildAdjacencyList = (vertices: CircleReceiver[]) => {
  const adjList = new Map<string, string[]>();

  vertices.forEach((v) => {
    adjList.set(v.id, v.nodeReceiver.attachedIds);
  });

  return adjList;
};
