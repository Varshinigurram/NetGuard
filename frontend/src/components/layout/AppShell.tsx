import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import type { BackendStatus } from '../../hooks/useBackendHealth';

interface AppShellProps {
  backendStatus: BackendStatus;
  lastUpdated: Date | null;
  onRefresh: () => void;
  refreshing: boolean;
  openAlerts: number;
}

export function AppShell({
  backendStatus, lastUpdated, onRefresh, refreshing, openAlerts,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        openAlerts={openAlerts}
      />
      <div
        className="app-content"
        style={{
          marginLeft: 0,
          transition: 'margin var(--transition-normal)',
        }}
      >
        <TopHeader
          backendStatus={backendStatus}
          lastUpdated={lastUpdated}
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
        <main className="app-main" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
