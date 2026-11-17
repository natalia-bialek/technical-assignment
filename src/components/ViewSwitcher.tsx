import { css, cx } from 'styled-system/css';
import { type KeyboardEvent, type ReactNode, useRef } from 'react';

import { type ViewId, type ViewOption, views } from '../data/fixtures';

export interface ViewSwitcherProps {
  activeView: ViewId;
  onViewChange: (view: ViewId) => void;
  panels: Record<ViewId, ReactNode>;
}

export const viewTabId = (view: ViewId) => `view-tab-${view}`;
export const viewPanelId = (view: ViewId) => `view-panel-${view}`;

const tabClass = css({
  alignItems: 'center',
  bg: 'transparent',
  borderBottomColor: 'transparent',
  borderBottomStyle: 'solid',
  borderBottomWidth: 'sm',
  color: 'text.primary',
  cursor: 'pointer',
  display: 'inline-flex',
  px: '4',
  py: '2',
  textAlign: 'left',
  textStyle: 't_small_b',
  _hover: { bg: 'surface.subtle', color: 'text.link_hover' },
  '&[aria-selected=true]': {
    borderBottomColor: 'border.selected',
    color: 'text.selected',
  },
  '&[aria-selected=true]:hover': {
    bg: 'surface.subtle',
    color: 'text.selected',
  },
  _focusVisible: {
    outlineColor: 'focus.default',
    outlineOffset: '0.125rem',
    outlineStyle: 'solid',
    outlineWidth: '0.125rem',
  },
});

const panelClass = css({
  _focusVisible: {
    outlineColor: 'focus.default',
    outlineOffset: '0.25rem',
    outlineStyle: 'solid',
    outlineWidth: '0.125rem',
  },
});

const schedulePanelClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '4',
});

export function ViewSwitcher({ activeView, onViewChange, panels }: ViewSwitcherProps) {
  const tabRefs = useRef(new Map<ViewId, HTMLButtonElement>());

  const selectView = (view: ViewId) => {
    onViewChange(view);
    tabRefs.current.get(view)?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = views.findIndex((view) => view.id === event.currentTarget.dataset.view);
    const lastIndex = views.length - 1;
    let nextIndex: number;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = lastIndex;
        break;
      default:
        return;
    }

    const nextView = views[nextIndex];
    if (nextView !== undefined) {
      event.preventDefault();
      selectView(nextView.id);
    }
  };

  const panel =
    activeView === 'medals' ? (
      <div
        role="tabpanel"
        id={viewPanelId(activeView)}
        aria-labelledby={viewTabId(activeView)}
        className={panelClass}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: APG tabs pattern: a panel without focusable content must be focusable.
        tabIndex={0}
      >
        {panels[activeView]}
      </div>
    ) : (
      <div
        role="tabpanel"
        id={viewPanelId(activeView)}
        aria-labelledby={viewTabId(activeView)}
        className={cx(panelClass, activeView === 'schedule' && schedulePanelClass)}
      >
        {panels[activeView]}
      </div>
    );

  return (
    <>
      <div
        role="tablist"
        aria-label="Views"
        className={css({
          borderBottomColor: 'border.secondary',
          borderBottomStyle: 'solid',
          borderBottomWidth: 'xs',
          display: 'flex',
          flexDirection: { base: 'column', md: 'row' },
          gap: '2',
        })}
      >
        {views.map((view: ViewOption) => {
          const isSelected = view.id === activeView;

          return (
            <button
              key={view.id}
              ref={(node) => {
                if (node === null) {
                  tabRefs.current.delete(view.id);
                } else {
                  tabRefs.current.set(view.id, node);
                }
              }}
              type="button"
              role="tab"
              id={viewTabId(view.id)}
              data-view={view.id}
              aria-selected={isSelected}
              aria-controls={isSelected ? viewPanelId(view.id) : undefined}
              className={tabClass}
              onKeyDown={handleKeyDown}
              onClick={() => onViewChange(view.id)}
            >
              {view.label}
            </button>
          );
        })}
      </div>
      {panel}
    </>
  );
}

ViewSwitcher.displayName = 'ViewSwitcher';
