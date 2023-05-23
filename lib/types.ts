export type NodeMetadata = {
  value: number;
  position: number;
  id: string;
  next?: NodeMetadata | null;
};
