import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Settings,
  Zap,
} from 'lucide-react';
import { ROUTES } from '../../config/routes';
import { cn } from '../../lib/utils';

const navItems = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.ANALYTICS, label: 'Analytics', icon: BarChart3 },
  { to: ROUTES.HR, label: 'HR Assistant', icon: Users },
  { to: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] lg:block">
      <div className="flex h-16 items-center gap-2 border-b border-[hsl(var(--border))] px-6">
        <Zap className="h-6 w-6 text-[hsl(var(--primary))]" />
        <span className="text-lg font-bold">SME InsightX</span>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
