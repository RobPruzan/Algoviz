import { ControlBarContextState } from '@/app/Context/ControlBarContext';
import { NodeContextState } from '@/app/Context/NodesContext';
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
  const [tempNodeRow, setTempNodeRow] = useState<NodeMetadata[]>();
};
