import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LogOut, Menu, Bell, Moon, Sun, Monitor, Globe,
  ChevronDown, User, Settings, HelpCircle, X,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useLogout } from '../../hooks/useAuth';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../lib/theme';
import { useNotificationStore } from '../../stores/notificationStore';
import { getDirection } from '../../lib/i18n';
import { getInitials, cn } from '../../lib/utils';
import { ROUTES } from '../../config/routes';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  const dir = getDirection(i18n.language);

  // Click outside handler
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => navigate(ROUTES.LOGIN),
    });
  };

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('sme-insightx-lang', next);
    document.documentElement.setAttribute('dir', getDirection(next));
    document.documentElement.setAttribute('lang', next);
  };

  const themeOptions = [
    { value: 'light' as const, icon: Sun, label: t('theme.light') },
    { value: 'dark' as const, icon: Moon, label: t('theme.dark') },
    { value: 'system' as const, icon: Monitor, label: t('theme.system') },
  ];

  return (
    <header className="flex h-16 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onToggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-1">
        {/* Language Toggle */}
        <Button variant="ghost" size="sm" onClick={toggleLang} className="gap-1.5 text-sm">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{i18n.language === 'en' ? 'EN' : 'AR'}</span>
        </Button>

        {/* Theme Toggle */}
        <div ref={themeRef} className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
          >
            {resolvedTheme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          {themeMenuOpen && (
            <div className={cn(
              "absolute top-full z-50 mt-1 w-36 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-1 shadow-lg",
              dir === 'rtl' ? 'left-0' : 'right-0'
            )}>
              {themeOptions.map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[hsl(var(--muted))]',
                    theme === value && 'text-[hsl(var(--primary))]',
                  )}
                  onClick={() => { setTheme(value); setThemeMenuOpen(false); }}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <Button variant="ghost" size="icon" onClick={() => setNotifOpen(!notifOpen)}>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </Button>
          {notifOpen && (
            <div className={cn(
              "absolute top-full z-50 mt-1 w-80 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg",
              dir === 'rtl' ? 'left-0' : 'right-0'
            )}>
              <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-3">
                <h4 className="text-sm font-semibold">{t('notifications.title')}</h4>
                {unreadCount > 0 && (
                  <button
                    className="text-xs text-[hsl(var(--primary))] hover:underline"
                    onClick={() => markAllAsRead()}
                  >
                    {t('notifications.mark_all_read')}
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
                    {t('notifications.no_notifications')}
                  </p>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <button
                      key={n.id}
                      className={cn(
                        'flex w-full items-start gap-3 border-b border-[hsl(var(--border))] p-3 text-start hover:bg-[hsl(var(--muted))]/50',
                        !n.read && 'bg-[hsl(var(--primary))]/5',
                      )}
                      onClick={() => markAsRead(n.id)}
                    >
                      <div className={cn(
                        'mt-1 h-2 w-2 shrink-0 rounded-full',
                        !n.read ? 'bg-[hsl(var(--primary))]' : 'bg-transparent',
                      )} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm">{t(n.titleKey, n.titleParams)}</p>
                        <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                          {new Date(n.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div ref={userMenuRef} className="relative">
          <button
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[hsl(var(--muted))]"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-xs font-medium text-[hsl(var(--primary-foreground))]">
              {user ? getInitials(user.name) : '?'}
            </div>
            <span className="hidden text-sm font-medium md:block">{user?.name}</span>
            <ChevronDown className="hidden h-3.5 w-3.5 text-[hsl(var(--muted-foreground))] md:block" />
          </button>

          {userMenuOpen && (
            <div className={cn(
              "absolute top-full z-50 mt-1 w-56 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-1 shadow-lg",
              dir === 'rtl' ? 'left-0' : 'right-0'
            )}>
              {/* User Info Header */}
              <div className="border-b border-[hsl(var(--border))] px-4 py-3">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{user?.email}</p>
                <p className="mt-1 text-xs capitalize text-[hsl(var(--primary))]">{user?.role}</p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link
                  to={ROUTES.SETTINGS}
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-[hsl(var(--muted))]"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  {t('nav.profile')}
                </Link>
                <Link
                  to={ROUTES.SETTINGS}
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-[hsl(var(--muted))]"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  {t('nav.settings')}
                </Link>
                <Link
                  to={ROUTES.SETTINGS}
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-[hsl(var(--muted))]"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <HelpCircle className="h-4 w-4" />
                  {t('nav.help')}
                </Link>
              </div>

              <div className="border-t border-[hsl(var(--border))] py-1">
                <button
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-[hsl(var(--muted))]"
                  onClick={() => { handleLogout(); setUserMenuOpen(false); }}
                >
                  <LogOut className="h-4 w-4" />
                  {t('nav.logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
