import { getSelectedItems } from '@/lib/utils';
import { useAppSelector } from '@/redux/store';

export const useGetSelectedItems = () => {
  const {
    attachableLines,
    circles,
    selectedGeometryInfo,
    validatorLensContainer,
  } = useAppSelector((store) => store.canvas.present);
  return getSelectedItems({
    attachableLines,
    circles,
    selectedGeometryInfo,
  });
};
