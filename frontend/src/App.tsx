import { useState, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { OverviewPage } from './pages/Overview';
import { DevicesPage } from './pages/Devices';
import { EventsPage } from './pages/Events';
import { AlertsPage } from './pages/Alerts';
import { AnomaliesPage } from './pages/Anomalies';
import { TopologyPage } from './pages/Topology';
import { useBackendHealth } from './hooks/useBackendHealth';
import { useApi } from './hooks/useApi';
import { getAlerts } from './services/api';

export default function App() {
  const { status: backendStatus } = useBackendHealth(10000);
  const alertsState = useApi(getAlerts, 5000);
  const [refreshTick, setRefreshTick] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    alertsState.refresh();
    setRefreshTick(t => t + 1);
    setTimeout(() => setRefreshing(false), 1000);
  }, [alertsState]);

  const openAlerts = alertsState.data?.filter(a => a.status === 'open').length ?? 0;

  return (
    <Routes>
      <Route
        element={
          <AppShell
            backendStatus={backendStatus}
            lastUpdated={alertsState.lastUpdated}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            openAlerts={openAlerts}
          />
        }
      >
        <Route path="/"          element={<OverviewPage key={refreshTick} />} />
        <Route path="/devices"   element={<DevicesPage  key={refreshTick} />} />
        <Route path="/events"    element={<EventsPage   key={refreshTick} />} />
        <Route path="/alerts"    element={<AlertsPage   key={refreshTick} />} />
        <Route path="/anomalies" element={<AnomaliesPage key={refreshTick} />} />
        <Route path="/topology"  element={<TopologyPage  key={refreshTick} />} />
      </Route>
    </Routes>
  );
}
