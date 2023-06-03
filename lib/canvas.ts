import { Circle } from './types';

export const replaceCircle = ({
  oldArray,
  newCircle,
}: {
  oldArray: Circle[];
  newCircle: Circle;
}) => {
  const newId = newCircle.id;
  const newArray = oldArray.filter((circle) => circle.id !== newId);
  newArray.push(newCircle);
  return newArray;
};
