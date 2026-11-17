import { css, cx } from 'styled-system/css';
import { useState } from 'react';

import { copy, type Session } from '../data/fixtures';

export interface ScheduleListProps {
  sessions: readonly Session[];
}

const detailsButtonClass = css({
  alignItems: 'center',
  bg: 'surface.base',
  borderColor: 'border.primary',
  borderRadius: 'md',
  borderStyle: 'solid',
  borderWidth: 'xs',
  color: 'text.primary',
  cursor: 'pointer',
  display: 'inline-flex',
  gap: '2',
  justifyContent: 'center',
  minH: '10',
  px: '4',
  textStyle: 't_small_b',
  _hover: { bg: 'surface.subtle' },
  _focusVisible: {
    outlineColor: 'focus.default',
    outlineOffset: '0.125rem',
    outlineStyle: 'solid',
    outlineWidth: '0.125rem',
  },
});

const chevronClass = css({
  flexShrink: '0',
  h: '1rem',
  w: '1rem',
  _motionSafe: { transition: 'transform 0.15s' },
});

const chevronOpenClass = css({ transform: 'rotate(180deg)' });

export function ScheduleList({ sessions }: ScheduleListProps) {
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(() => new Set());

  const handleToggle = (sessionId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(sessionId)) {
        next.delete(sessionId);
      } else {
        next.add(sessionId);
      }
      return next;
    });
  };

  return (
    <ul
      className={css({
        display: 'flex',
        flexDirection: 'column',
        gap: '3',
        listStyle: 'none',
        m: '0',
        p: '0',
      })}
    >
      {sessions.map((session) => {
        const isExpanded = expandedIds.has(session.id);
        const detailId = `${session.id}-detail`;

        return (
          <li
            key={session.id}
            className={css({
              alignItems: { md: 'center' },
              bg: 'surface.base',
              borderColor: 'border.primary',
              borderRadius: 'lg',
              borderStyle: 'solid',
              borderWidth: 'xs',
              display: 'flex',
              flexDirection: { base: 'column', md: 'row' },
              flexWrap: 'wrap',
              gap: '3',
              p: '4',
            })}
          >
            <h2 className={css({ color: 'text.primary', textStyle: 'h_small' })}>{session.name}</h2>
            <p className={css({ color: 'text.secondary', textStyle: 't_small' })}>
              {session.venue}
            </p>
            <p className={css({ color: 'text.primary', textStyle: 't_small' })}>{session.status}</p>
            <button
              type="button"
              aria-expanded={isExpanded}
              aria-controls={isExpanded ? detailId : undefined}
              className={detailsButtonClass}
              onClick={() => handleToggle(session.id)}
            >
              {isExpanded ? copy.hideDetails : copy.showDetails}
              <span className={css({ srOnly: true })}>{` ${copy.detailsFor} ${session.name}`}</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className={cx(chevronClass, isExpanded && chevronOpenClass)}
              >
                <path
                  d="M3.5 6l4.5 4.5L12.5 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {isExpanded && (
              <p
                id={detailId}
                className={css({
                  color: 'text.primary',
                  flexBasis: '100%',
                  textStyle: 't_small',
                  w: 'full',
                })}
              >
                {session.detail}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

ScheduleList.displayName = 'ScheduleList';
