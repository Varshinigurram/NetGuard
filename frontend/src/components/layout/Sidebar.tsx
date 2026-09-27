import { NavLink } from 'react-router-dom';
import {
  Shield, Monitor, AlertTriangle, Bell, Activity, Network,
  ChevronLeft, ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  openAlerts: number;
}

const navItems = [
  { to: '/',          icon: Monitor,       label: 'Overview',         end: true },
  { to: '/devices',   icon: Network,       label: 'Devices' },
  { to: '/events',    icon: Activity,      label: 'Security Events' },
  { to: '/alerts',    icon: Bell,          label: 'Alerts',           alertKey: true },
  { to: '/anomalies', icon: AlertTriangle, label: 'Anomalies' },
  { to: '/topology',  icon: Shield,        label: 'Network Topology' },
];

export function Sidebar({ collapsed, onToggle, openAlerts }: SidebarProps) {
  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`} aria-label="Main navigation">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon" aria-hidden="true">
          <Shield size={18} />
        </div>
        {!collapsed && (
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-name">NETGUARD</div>
            <div className="sidebar-brand-sub">Security Monitor</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="sidebar-nav" aria-label="Primary">
        {!collapsed && <div className="sidebar-nav-label">Navigation</div>}
        {navItems.map(({ to, icon: Icon, label, end, alertKey }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            title={collapsed ? label : undefined}
            aria-label={label}
          >
            <Icon size={18} className="nav-item-icon" aria-hidden="true" />
            {!collapsed && (
              <>
                <span className="nav-item-label">{label}</span>
                {alertKey && openAlerts > 0 && (
                  <span className="nav-item-badge" aria-label={`${openAlerts} open alerts`}>
                    {openAlerts}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Toggle */}
      <div className="sidebar-toggle">
        <button
          className="btn-icon"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
