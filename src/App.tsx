import { css } from 'styled-system/css';
import { Stack } from 'styled-system/jsx';
import { useCallback, useState } from 'react';

import { AlertsModal } from './components/AlertsModal';
import { ResultsTable } from './components/ResultsTable';
import { ScheduleList } from './components/ScheduleList';
import { SessionFilters } from './components/SessionFilters';
import { SiteHeader } from './components/SiteHeader';
import { ViewSwitcher } from './components/ViewSwitcher';
import { copy, filterSessions, type SessionFilterId, sessions, type ViewId } from './data/fixtures';

export function App() {
  const [activeView, setActiveView] = useState<ViewId>('schedule');
  const [activeFilter, setActiveFilter] = useState<SessionFilterId>('all');
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  const handleCloseAlerts = useCallback(() => {
    setIsAlertsOpen(false);
  }, []);

  const visibleSessions = filterSessions(sessions, activeFilter);

  return (
    <div
      className={css({
        color: 'text.primary',
        maxW: { md: '48rem' },
        mx: 'auto',
        px: { base: '4', md: '8' },
        py: { base: '6', md: '8' },
        w: 'full',
      })}
    >
      <Stack gap="6">
        <SiteHeader onManageAlerts={() => setIsAlertsOpen(true)} />
        {isAlertsOpen && <AlertsModal onClose={handleCloseAlerts} />}
        <main>
          <Stack gap="6">
            <ViewSwitcher
              activeView={activeView}
              onViewChange={setActiveView}
              panels={{
                schedule: (
                  <>
                    <SessionFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                    <p role="status" className={css({ srOnly: true })}>
                      {copy.sessionsShown(visibleSessions.length)}
                    </p>
                    <ScheduleList sessions={visibleSessions} />
                  </>
                ),
                results: <ResultsTable />,
                medals: (
                  <p className={css({ color: 'text.primary', textStyle: 't_medium' })}>
                    {copy.medals}
                  </p>
                ),
              }}
            />
          </Stack>
        </main>
      </Stack>
    </div>
  );
}

App.displayName = 'App';
