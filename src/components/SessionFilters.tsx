import { css, cx } from 'styled-system/css';
import { Flex } from 'styled-system/jsx';

import { type SessionFilterId, sessionFilters } from '../data/fixtures';

export interface SessionFiltersProps {
  activeFilter: SessionFilterId;
  onFilterChange: (filter: SessionFilterId) => void;
}

const chipClass = css({
  alignItems: 'center',
  bg: 'surface.base',
  borderColor: 'border.primary',
  borderRadius: 'full',
  borderStyle: 'solid',
  borderWidth: 'xs',
  color: 'text.primary',
  cursor: 'pointer',
  display: 'inline-flex',
  minH: '10',
  px: '4',
  textStyle: 't_small',
  userSelect: 'none',
  _hover: { bg: 'surface.subtle' },
  _focusVisible: {
    outlineColor: 'focus.default',
    outlineOffset: '0.125rem',
    outlineStyle: 'solid',
    outlineWidth: '0.125rem',
  },
});

// The selected chip is marked by weight and border width as well as colour,
// so the state is visible without relying on colour alone (WCAG 1.4.1).
const selectedChipClass = css({
  bg: 'surface.brand',
  borderColor: 'border.brand',
  borderWidth: 'sm',
  color: 'text.on_brand',
  fontWeight: '700',
  _hover: {
    bg: 'action.brand_hover',
    boxShadow: '0 0 0 2px var(--colors-text-primary)',
  },
});

export function SessionFilters({ activeFilter, onFilterChange }: SessionFiltersProps) {
  return (
    <Flex
      role="group"
      aria-label="Filter sessions"
      direction={{ base: 'column', md: 'row' }}
      gap="2"
    >
      {sessionFilters.map((filter) => {
        const isSelected = filter.id === activeFilter;

        return (
          <button
            key={filter.id}
            type="button"
            aria-pressed={isSelected}
            className={cx(chipClass, isSelected && selectedChipClass)}
            onClick={() => onFilterChange(filter.id)}
          >
            {filter.label}
          </button>
        );
      })}
    </Flex>
  );
}

SessionFilters.displayName = 'SessionFilters';
