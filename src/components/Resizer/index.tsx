import React, { useCallback, useMemo, useState } from 'react';
import { BeginDragCallback } from '../SplitPane/hooks/effects/useDragState';
import {
  ButtonContainer,
  ButtonWrapper,
  getSizeWithUnit,
  ResizeGrabber,
  ResizePresentation,
} from './helpers';
import { useMergeClasses } from '../../hooks/useMergeClasses';
import { CollapseOptions, ResizerOptions } from '../SplitPane';
import { SplitType } from '../SplitPane';
import { debounce } from '../SplitPane/helpers';

const defaultResizerOptions: Required<ResizerOptions> = {
  grabberSize: '1rem',
  css: { backgroundColor: 'rgba(120, 120, 120, 0.3)' },
  hoverCss: { backgroundColor: 'rgba(120, 120, 120, 0.6)' },
};

export interface ResizerProps {
  isVertical: boolean;
  isLtr: boolean;
  split: SplitType;
  className?: string;
  paneIndex: number;
  collapseOptions?: CollapseOptions;
  resizerOptions?: Partial<ResizerOptions>;
  onDragStarted: BeginDragCallback;
  onCollapseToggle: (paneIndex: number) => void;
  isCollapsed: boolean;
}
export const Resizer = ({
  isVertical,
  split,
  className,
  paneIndex,
  onDragStarted,
  resizerOptions,
  collapseOptions,
  onCollapseToggle,
  isLtr,
  isCollapsed,
}: ResizerProps) => {
  const { grabberSize, css, hoverCss } = { ...defaultResizerOptions, ...resizerOptions };

  const classes = useMergeClasses(['Resizer', split, className]);
  const grabberSizeWithUnit = useMemo(() => getSizeWithUnit(grabberSize), [grabberSize]);

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      if (!isCollapsed) {
        onDragStarted({ index: paneIndex, position: event });
      }
    },
    [paneIndex, isCollapsed, onDragStarted]
  );
  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      event.preventDefault();
      if (!isCollapsed) {
        onDragStarted({ index: paneIndex, position: event.touches[0] });
      }
    },
    [paneIndex, isCollapsed, onDragStarted]
  );
  const handleButtonClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onCollapseToggle(paneIndex);
    },
    [paneIndex, onCollapseToggle]
  );
  const handleButtonMousedown = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  const debouncedSetHovered = useCallback(
    debounce(() => setIsHovered(true), 50),
    [setIsHovered]
  );
  const handleMouseEnterGrabber = useCallback(() => {
    debouncedSetHovered();
  }, [debouncedSetHovered]);

  const debouncedSetNotHovered = useCallback(
    debounce(() => setIsHovered(false), 100),
    [setIsHovered]
  );
  const handleMouseLeaveGrabber = useCallback(() => debouncedSetNotHovered(), [
    debouncedSetNotHovered,
  ]);

  const getWidthOrHeight = useCallback(
    (size: string | number) => (isVertical ? { width: size } : { height: size }),
    [isVertical]
  );
  const preButtonFlex = useMemo(
    () => Math.max(100 - (collapseOptions?.buttonPositionOffset ?? 0), 0),
    [collapseOptions]
  );
  const postButtonFlex = useMemo(
    () => Math.max(100 + (collapseOptions?.buttonPositionOffset ?? 0), 0),
    [collapseOptions]
  );
  const collapseButton = collapseOptions ? (
    <ButtonContainer $isVertical={isVertical} $grabberSize={grabberSizeWithUnit} $isLtr={isLtr}>
      <div style={{ flex: `1 1 ${preButtonFlex}` }} />
      <div
        style={{
          flex: '0 0 0',
          position: 'relative',
          opacity: isHovered ? undefined : 0,
          transition: `opacity ${collapseOptions.buttonTransitionTimeout}ms ease-in-out`,
        }}
      >
        <ButtonWrapper
          $isVertical={isVertical}
          onClick={handleButtonClick}
          onMouseDown={handleButtonMousedown}
        >
          {isCollapsed ? collapseOptions.afterToggleButton : collapseOptions.beforeToggleButton}
        </ButtonWrapper>
      </div>
      <div style={{ flex: `1 1 ${postButtonFlex}` }} />
    </ButtonContainer>
  ) : null;

  return (
    <div key="grabber.root" style={{ position: 'relative' }}>
      <ResizeGrabber
        key="grabber"
        $isVertical={isVertical}
        $isCollapsed={isCollapsed}
        $isLtr={isLtr}
        style={getWidthOrHeight(grabberSize)}
        role="presentation"
        className={classes}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onMouseEnter={handleMouseEnterGrabber}
        onMouseLeave={handleMouseLeaveGrabber}
      >
        {collapseButton}
      </ResizeGrabber>
      <ResizePresentation
        $isVertical={isVertical}
        style={{
          ...getWidthOrHeight(1),
          opacity: isHovered ? 0 : undefined,
          transition: `opacity ${collapseOptions?.buttonTransitionTimeout ?? 200}ms ease-in-out`,
          ...css,
        }}
      />
      <ResizePresentation
        $isVertical={isVertical}
        style={{
          ...getWidthOrHeight(1),
          opacity: isHovered ? undefined : 0,
          transition: `opacity ${collapseOptions?.buttonTransitionTimeout ?? 200}ms ease-in-out`,
          ...hoverCss,
        }}
      />
    </div>
  );
};
Resizer.displayName = 'Resizer';
