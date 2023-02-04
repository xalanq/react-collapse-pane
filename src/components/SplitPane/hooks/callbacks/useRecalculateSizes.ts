import { addArray, getMinSize } from '../../helpers';
import React, { useCallback } from 'react';

export const useRecalculateSizes = ({
  getCurrentPaneSizes,
  collapsedSize,
  collapsedIndices,
  setMovedSizes,
  setSizes,
  minSizes,
}: {
  getCurrentPaneSizes: () => number[];
  collapsedIndices: number[];
  collapsedSize: number;
  originalMinSizes: number | number[] | undefined;
  minSizes: number[];
  setMovedSizes: React.Dispatch<React.SetStateAction<number[]>>;
  setSizes: React.Dispatch<React.SetStateAction<number[]>>;
}) =>
  useCallback(
    (initialSizes?: number[]) => {
      const curSizes = getCurrentPaneSizes();
      const ratio =
        initialSizes && initialSizes.length > 0 ? addArray(curSizes) / addArray(initialSizes) : 1;
      const initialRatioSizes = initialSizes ? initialSizes.map(size => size * ratio) : curSizes;
      const constrainSizes = initialRatioSizes.map((size, idx) =>
        Math.max(getMinSize(idx, minSizes), size)
      );
      const adjustedSizes = constrainSizes.map((size, idx) => {
        if (collapsedIndices.includes(idx)) {
          return collapsedSize;
        }
        if (collapsedIndices.includes(idx - 1)) {
          const totalPrevSizeToAdd = addArray(
            collapsedIndices
              .filter((_collapsedIdx, index) => index <= idx)
              .map((_i, index) => constrainSizes[index] - collapsedSize)
          );
          return size + totalPrevSizeToAdd;
        }
        return size;
      });
      setMovedSizes(adjustedSizes);
      setSizes(adjustedSizes);
    },
    [collapsedIndices, collapsedSize, getCurrentPaneSizes, setMovedSizes, setSizes, minSizes]
  );
