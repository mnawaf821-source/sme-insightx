import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, BarChart3, Users, Settings, Zap,
  ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { ROUTES } from '../../config/routes';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { to: ROUTES.DASHBOARD, label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: ROUTES.ANALYTICS, label: t('nav.analytics'), icon: BarChart3 },
    { to: ROUTES.HR, label: t('nav.hr'), icon: Users },
    { to: ROUTES.SETTINGS, label: t('nav.settings'), icon: Settings },
  ];

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-[hsl(var(--border))] px-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
            <Zap className="h-5 w-5 text-[hsl(var(--primary-foreground))]" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold whitespace-nowrap">{t('app.name')}</span>
          )}
        </div>
        {/* Mobile close */}
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMobileClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onMobileClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]',
                collapsed && 'justify-center px-2',
              )
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle - Desktop only */}
      <div className="hidden border-t border-[hsl(var(--border))] p-3 lg:block">
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
              <span>{t('common.close')}</span>
            </>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-all duration-300 lg:flex',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
          <aside className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex w-64 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
