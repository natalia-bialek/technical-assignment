import { css, cx } from 'styled-system/css';
import { Box } from 'styled-system/jsx';
import { useId, useState } from 'react';

import { type AthleteResult, copy, results } from '../data/fixtures';

type SortColumn = 'rank' | 'bib';

type SortDirection = 'asc' | 'desc';

interface ColumnDirections {
  rank: SortDirection;
  bib: SortDirection;
}

const scrollRegionClass = css({
  overflowX: 'auto',
  _focusVisible: {
    outlineColor: 'focus.default',
    outlineOffset: '0.125rem',
    outlineStyle: 'solid',
    outlineWidth: '0.125rem',
  },
});

const tableClass = css({
  borderCollapse: 'collapse',
  color: 'text.primary',
  textStyle: 't_small',
  w: 'full',
});

const captionClass = css({
  color: 'text.primary',
  pb: '3',
  textAlign: 'left',
  textStyle: 'h_small',
});

const headerCellClass = css({
  bg: 'surface.base_alt',
  borderBottomColor: 'border.primary',
  borderBottomStyle: 'solid',
  borderBottomWidth: 'xs',
  color: 'text.primary',
  px: '3',
  py: '2',
  textAlign: 'left',
});

const bodyCellClass = css({
  borderBottomColor: 'border.secondary',
  borderBottomStyle: 'solid',
  borderBottomWidth: 'xs',
  px: '3',
  py: '2',
  textAlign: 'left',
});

const sortButtonClass = css({
  alignItems: 'center',
  bg: 'transparent',
  borderRadius: 'md',
  borderWidth: '0',
  color: 'text.primary',
  cursor: 'pointer',
  display: 'inline-flex',
  gap: '1',
  p: '1',
  textStyle: 't_small_b',
  _hover: { bg: 'surface.subtle', textDecoration: 'underline' },
  _focusVisible: {
    outlineColor: 'focus.default',
    outlineOffset: '0.125rem',
    outlineStyle: 'solid',
    outlineWidth: '0.125rem',
  },
});

const standingClass = {
  Qualified: css({ bg: 'feedback.success.bg', color: 'text.primary' }),
  Eliminated: css({ bg: 'feedback.error.bg', color: 'text.primary' }),
} as const;

const rowClass = css({
  _hover: { '& > td:not([data-standing])': { bg: 'surface.base_alt' } },
});

const ariaSortValue = {
  asc: 'ascending',
  desc: 'descending',
} as const;

const flipDirection = (direction: SortDirection): SortDirection =>
  direction === 'asc' ? 'desc' : 'asc';

const sortResults = (
  rows: readonly AthleteResult[],
  column: SortColumn,
  direction: SortDirection,
): AthleteResult[] =>
  rows.toSorted((left, right) => {
    const delta = left[column] - right[column];
    return direction === 'asc' ? delta : -delta;
  });

export function ResultsTable() {
  const [column, setColumn] = useState<SortColumn>('rank');
  const [directions, setDirections] = useState<ColumnDirections>({ rank: 'asc', bib: 'asc' });
  const captionId = useId();

  const handleSort = (nextColumn: SortColumn) => {
    setDirections((current) => ({
      ...current,
      [nextColumn]: flipDirection(current[nextColumn]),
    }));
    setColumn(nextColumn);
  };

  const sortedRows = sortResults(results, column, directions[column]);

  const renderSortableHeader = (sortColumn: SortColumn, label: string) => {
    const isActive = column === sortColumn;

    return (
      <th
        scope="col"
        aria-sort={isActive ? ariaSortValue[directions[sortColumn]] : undefined}
        className={headerCellClass}
      >
        <button type="button" className={sortButtonClass} onClick={() => handleSort(sortColumn)}>
          {label}
          {isActive && (
            <span aria-hidden="true">{directions[sortColumn] === 'asc' ? '▲' : '▼'}</span>
          )}
        </button>
      </th>
    );
  };

  return (
    <Box role="region" aria-labelledby={captionId} tabIndex={0} className={scrollRegionClass}>
      <table className={tableClass}>
        <caption id={captionId} className={captionClass}>
          {copy.resultsCaption}
        </caption>
        <thead>
          <tr>
            {renderSortableHeader('rank', copy.rank)}
            {renderSortableHeader('bib', copy.bib)}
            <th scope="col" className={headerCellClass}>
              {copy.athlete}
            </th>
            <th scope="col" className={headerCellClass}>
              {copy.noc}
            </th>
            <th scope="col" className={headerCellClass}>
              {copy.status}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr key={row.bib} className={rowClass}>
              <td className={bodyCellClass}>{row.rank}</td>
              <td className={bodyCellClass}>{row.bib}</td>
              <td className={bodyCellClass}>{row.athlete}</td>
              <td className={bodyCellClass}>{row.noc}</td>
              <td
                data-standing={row.standing}
                className={cx(bodyCellClass, standingClass[row.standing])}
              >
                {row.standing}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}

ResultsTable.displayName = 'ResultsTable';
