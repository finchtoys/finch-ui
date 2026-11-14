export function topmostModalIndex(zIndexes: readonly number[]): number {
  let topmostIndex = -1;
  let topmostZIndex = Number.NEGATIVE_INFINITY;
  zIndexes.forEach((zIndex, index) => {
    if (zIndex >= topmostZIndex) {
      topmostIndex = index;
      topmostZIndex = zIndex;
    }
  });
  return topmostIndex;
}
