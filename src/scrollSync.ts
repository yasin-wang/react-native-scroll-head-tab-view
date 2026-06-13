export function getSyncedSceneOffset(
  sourceOffset: number,
  targetOffset: number,
  collapseDistance: number,
) {
  const boundedSourceOffset = Math.max(0, sourceOffset);
  const boundedTargetOffset = Math.max(0, targetOffset);
  const boundedCollapseDistance = Math.max(0, collapseDistance);

  if (boundedSourceOffset < boundedCollapseDistance) {
    return boundedSourceOffset;
  }

  return Math.max(boundedTargetOffset, boundedCollapseDistance);
}
