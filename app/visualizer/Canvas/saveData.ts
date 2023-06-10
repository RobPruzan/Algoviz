// if (
//   isMouseDownRef.current &&
//   selectedGeometryInfo &&
//   selectedGeometryInfo.selectedIds.size > 0 &&
//   Canvas.isPointInRectangle(
//     [event.nativeEvent.offsetX, event.nativeEvent.offsetY],
//     selectedGeometryInfo.maxPoints.closestToOrigin,
//     selectedGeometryInfo.maxPoints.furthestFromOrigin
//   )
// ) {
//   ('inside wee');
//   const prevPos = previousMousePositionRef.current;
//   if (!prevPos) return;

//   const shift: [number, number] = [
//     prevPos[0] - event.nativeEvent.offsetX,
//     prevPos[1] - event.nativeEvent.offsetY,
//   ];

//   const shiftedEdges = attachableLines.map((line) => {
//     const newLine: Edge = {
//       ...line,
//       x1: line.x1 - shift[0],
//       y1: line.y1 - shift[1],
//       x2: line.x2 - shift[0],
//       y2: line.y2 - shift[1],
//       attachNodeOne: {
//         ...line.attachNodeOne,
//         center: [
//           line.attachNodeOne.center[0] - shift[0],
//           line.attachNodeOne.center[1] - shift[1],
//         ],
//       },
//       attachNodeTwo: {
//         ...line.attachNodeTwo,
//         center: [
//           line.attachNodeTwo.center[0] - shift[0],
//           line.attachNodeTwo.center[1] - shift[1],
//         ],
//       },
//     };

//     return newLine;
//   });

//   dispatch(CanvasActions.setLines(shiftedEdges));
//   setSelectedGeometryInfo((prev) =>
//     prev
//       ? {
//           ...prev,
//           maxPoints: {
//             closestToOrigin: [
//               prev.maxPoints.closestToOrigin[0] - shift[0],
//               prev.maxPoints.closestToOrigin[1] - shift[1],
//             ],
//             furthestFromOrigin: [
//               prev.maxPoints.furthestFromOrigin[0] - shift[0],
//               prev.maxPoints.furthestFromOrigin[1] - shift[1],
//             ],
//           },
//         }
//       : null
//   );
// }
