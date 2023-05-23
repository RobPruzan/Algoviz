import { ControlBarContextState } from '@/Context/ControlBarContext';
import { NodeContextState } from '@/Context/NodesContext';
import { NodeMetadata } from '@/lib/types';
import { useState } from 'react';

type QuickSortParams = ControlBarContextState & NodeContextState;
export const useQuickSort = ({
  items,
  multiplier,
  nodeRows,
  playing,
  setNodeRows,
}: QuickSortParams) => {
  // we obviously need to actually quicksort the array
  // we should have a temp, and then once we're done we can visualize the new array however we want
  // could be as simple as if the node has no next then it has a border which represents the new array :thinking
  const [tempNodeRow, setTempNodeRow] = useState<NodeMetadata[]>();
};
