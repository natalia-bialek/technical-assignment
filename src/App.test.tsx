import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';

import { App } from './App';

const expectNoAxeViolations = async (container: HTMLElement) => {
  const { violations } = await axe.run(container, {
    rules: {
      // happy-dom does not compute layout or colours; contrast is checked manually in audit.md.
      'color-contrast': { enabled: false },
    },
  });

  expect(
    violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) })),
  ).toEqual([]);
};

describe('Championship Day', () => {
  it('renders the page heading', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'Championship Day' })).toBeInTheDocument();
  });

  it('shows every heat on the schedule', () => {
    render(<App />);

    expect(screen.getByText('Heat 1')).toBeInTheDocument();
    expect(screen.getByText('Heat 2')).toBeInTheDocument();
    expect(screen.getByText('Heat 3')).toBeInTheDocument();
  });

  it('shows finished sessions when Finished is chosen', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Finished' }));

    expect(screen.getByText('Heat 2')).toBeInTheDocument();
    expect(screen.queryByText('Heat 1')).not.toBeInTheDocument();
  });

  it('shows an athlete when Results is chosen', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: 'Results' }));

    expect(screen.getByText('Lena Berg')).toBeInTheDocument();
  });

  it('shows the medal ceremonies note when Medals is chosen', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: 'Medals' }));

    expect(
      screen.getByText('Medal ceremonies are published after the final heat.'),
    ).toBeInTheDocument();
  });

  it('shows the heat detail when Details is activated', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Show details for Heat 1' }));

    expect(screen.getByText('First run starts at 10:15.')).toBeInTheDocument();
  });

  it('opens and closes alert preferences', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Manage alerts' }));
    expect(screen.getByText('Heat changes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('Heat changes')).not.toBeInTheDocument();
  });

  it('shows a confirmation when the share control is used', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Copy link' }));

    expect(screen.getByText('Link copied')).toBeInTheDocument();
  });
});

describe('Session filters', () => {
  it('reaches and activates every filter with the keyboard', async () => {
    const user = userEvent.setup();
    render(<App />);

    const group = screen.getByRole('group', { name: 'Filter sessions' });
    const liveOnly = within(group).getByRole('button', { name: 'Live only' });
    const allSessions = within(group).getByRole('button', { name: 'All sessions' });
    const finished = within(group).getByRole('button', { name: 'Finished' });

    liveOnly.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByText('Heat 1')).toBeInTheDocument();
    expect(screen.queryByText('Heat 2')).not.toBeInTheDocument();

    await user.tab();
    expect(allSessions).toHaveFocus();
    await user.tab();
    expect(finished).toHaveFocus();
    await user.keyboard(' ');
    expect(screen.getByText('Heat 2')).toBeInTheDocument();
    expect(screen.queryByText('Heat 1')).not.toBeInTheDocument();
  });

  it('exposes which filter is active', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole('button', { name: 'All sessions' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Live only' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    await user.click(screen.getByRole('button', { name: 'Live only' }));

    expect(screen.getByRole('button', { name: 'Live only' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'All sessions' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('announces how many sessions are shown', async () => {
    const user = userEvent.setup();
    render(<App />);

    const panel = screen.getByRole('tabpanel', { name: 'Schedule' });
    expect(within(panel).getByRole('status')).toHaveTextContent('3 sessions shown');

    await user.click(screen.getByRole('button', { name: 'Finished' }));

    expect(within(panel).getByRole('status')).toHaveTextContent('1 session shown');
  });
});

describe('View tabs', () => {
  it('connects the selected tab to its panel', () => {
    render(<App />);

    const scheduleTab = screen.getByRole('tab', { name: 'Schedule' });
    const panel = screen.getByRole('tabpanel', { name: 'Schedule' });

    expect(scheduleTab).toHaveAttribute('aria-selected', 'true');
    expect(scheduleTab).toHaveAttribute('aria-controls', panel.id);
  });

  it('tabs into the open view and switches with Enter and arrow keys', async () => {
    const user = userEvent.setup();
    render(<App />);

    const scheduleTab = screen.getByRole('tab', { name: 'Schedule' });
    const resultsTab = screen.getByRole('tab', { name: 'Results' });
    const medalsTab = screen.getByRole('tab', { name: 'Medals' });

    scheduleTab.focus();
    await user.tab();
    expect(resultsTab).toHaveFocus();
    expect(scheduleTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Schedule' })).toBeInTheDocument();

    await user.tab();
    expect(medalsTab).toHaveFocus();
    expect(screen.getByRole('tabpanel', { name: 'Schedule' })).toBeInTheDocument();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Live only' })).toHaveFocus();

    resultsTab.focus();
    await user.keyboard('{Enter}');
    expect(resultsTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Results' })).toBeInTheDocument();

    await user.tab();
    expect(medalsTab).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('region', { name: 'Heat results' })).toHaveFocus();

    medalsTab.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('tabpanel', { name: 'Medals' })).toBeInTheDocument();

    await user.tab();
    expect(screen.getByRole('tabpanel', { name: 'Medals' })).toHaveFocus();

    medalsTab.focus();
    await user.keyboard('{ArrowRight}');
    expect(scheduleTab).toHaveFocus();
    expect(scheduleTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Schedule' })).toBeInTheDocument();

    await user.keyboard('{End}');
    expect(medalsTab).toHaveFocus();
    expect(screen.getByRole('tabpanel', { name: 'Medals' })).toBeInTheDocument();

    await user.keyboard('{ArrowRight}');
    expect(scheduleTab).toHaveFocus();

    await user.keyboard('{ArrowLeft}');
    expect(medalsTab).toHaveFocus();

    await user.keyboard('{Home}');
    expect(scheduleTab).toHaveFocus();
  });
});

describe('Schedule details', () => {
  it('gives each Details button a unique name and exposes its expanded state', async () => {
    const user = userEvent.setup();
    render(<App />);

    const heatOne = screen.getByRole('button', { name: 'Show details for Heat 1' });
    expect(screen.getByRole('button', { name: 'Show details for Heat 2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show details for Heat 3' })).toBeInTheDocument();
    expect(heatOne).toHaveAttribute('aria-expanded', 'false');

    await user.click(heatOne);

    expect(heatOne).toHaveAttribute('aria-expanded', 'true');
    expect(heatOne).toHaveAccessibleName('Hide details for Heat 1');
    const detail = screen.getByText('First run starts at 10:15.');
    expect(heatOne).toHaveAttribute('aria-controls', detail.id);

    await user.click(heatOne);

    expect(heatOne).toHaveAttribute('aria-expanded', 'false');
    expect(heatOne).toHaveAccessibleName('Show details for Heat 1');
    expect(screen.queryByText('First run starts at 10:15.')).not.toBeInTheDocument();
  });
});

describe('Alert preferences dialog', () => {
  it('is a named modal dialog that takes focus', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Manage alerts' }));

    const dialog = screen.getByRole('dialog', { name: 'Alert preferences' });
    expect(dialog).toHaveAttribute('open');
    expect(within(dialog).getByRole('checkbox', { name: 'Heat changes' })).toHaveFocus();
  });

  it('closes with Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<App />);

    const trigger = screen.getByRole('button', { name: 'Manage alerts' });
    await user.click(trigger);
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('returns focus to the trigger after Close', async () => {
    const user = userEvent.setup();
    render(<App />);

    const trigger = screen.getByRole('button', { name: 'Manage alerts' });
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(trigger).toHaveFocus();
  });
});

describe('Header controls', () => {
  it('names the favourite toggle and exposes its state', async () => {
    const user = userEvent.setup();
    render(<App />);

    const favourite = screen.getByRole('button', { name: 'Favourite' });
    expect(favourite).toHaveAttribute('aria-pressed', 'false');

    await user.click(favourite);

    expect(favourite).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps the status region mounted so the confirmation is announced', async () => {
    const user = userEvent.setup();
    render(<App />);

    const banner = screen.getByRole('banner');
    const status = within(banner).getByRole('status');
    expect(status).toBeEmptyDOMElement();

    await user.click(screen.getByRole('button', { name: 'Copy link' }));

    expect(within(banner).getByRole('status')).toBe(status);
    expect(status).toHaveTextContent('Link copied');
  });

  it('describes the information in the banner image', () => {
    render(<App />);

    expect(
      screen.getByRole('img', { name: 'Alpine skiing. Course: 58 gates, 180 m vertical drop' }),
    ).toBeInTheDocument();
  });
});

describe('Results table', () => {
  const openResults = async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('tab', { name: 'Results' }));
    return user;
  };

  it('states each result in text, not only colour', async () => {
    await openResults();

    const rows = within(screen.getByRole('table', { name: 'Heat results' })).getAllByRole('row');
    const statusByAthlete = Object.fromEntries(
      rows.slice(1).map((row) => {
        const cells = within(row).getAllByRole('cell');
        return [cells[2]?.textContent, cells[4]?.textContent];
      }),
    );

    expect(statusByAthlete).toEqual({
      'Lena Berg': 'Qualified',
      'Maya Chen': 'Qualified',
      'Sofia Rossi': 'Eliminated',
      'Hana Novak': 'Eliminated',
    });
  });

  it('renders a single table with a header for every column', async () => {
    await openResults();

    expect(screen.getAllByRole('table')).toHaveLength(1);
    expect(
      screen.getAllByRole('columnheader').map((header) => header.textContent?.replace(/[▲▼]/, '')),
    ).toEqual(['Rank', 'Bib', 'Athlete', 'NOC', 'Status']);
  });

  it('names sort buttons by their visible label and exposes the sort order', async () => {
    const user = await openResults();

    const rankHeader = screen.getByRole('columnheader', { name: /Rank/ });
    const bibHeader = screen.getByRole('columnheader', { name: /Bib/ });
    expect(rankHeader).toHaveAttribute('aria-sort', 'ascending');
    expect(bibHeader).not.toHaveAttribute('aria-sort');

    await user.click(screen.getByRole('button', { name: 'Bib' }));

    expect(bibHeader).toHaveAttribute('aria-sort', 'descending');
    expect(rankHeader).not.toHaveAttribute('aria-sort');
    const firstRow = within(screen.getByRole('table')).getAllByRole('row')[1];
    expect(firstRow).toHaveTextContent('Hana Novak');
  });

  it('makes the scrollable table region keyboard focusable', async () => {
    await openResults();

    expect(screen.getByRole('region', { name: 'Heat results' })).toHaveAttribute('tabindex', '0');
  });
});

describe('Automated accessibility checks', () => {
  it('has no axe violations on the schedule view', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    await user.click(screen.getByRole('button', { name: 'Show details for Heat 1' }));

    await expectNoAxeViolations(container);
  });

  it('has no axe violations on the results view', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    await user.click(screen.getByRole('tab', { name: 'Results' }));

    await expectNoAxeViolations(container);
  });

  it('has no axe violations on the medals view', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    await user.click(screen.getByRole('tab', { name: 'Medals' }));

    await expectNoAxeViolations(container);
  });

  it('has no axe violations with the alerts dialog open', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    await user.click(screen.getByRole('button', { name: 'Manage alerts' }));

    await expectNoAxeViolations(container);
  });
});
