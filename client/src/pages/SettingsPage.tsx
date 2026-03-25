import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User, Shield, Bell, Palette, Building2, Database,
  Moon, Sun, Monitor, Globe, Key, Copy, Trash2, Plus,
  Download, LogOut, ChevronRight,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../lib/theme';
import { getDirection } from '../lib/i18n';
import { cn } from '../lib/utils';

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { theme, setTheme } = useTheme();
  const dir = getDirection(i18n.language);

  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [orgName, setOrgName] = useState('My Organization');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  // Notification prefs (local state)
  const [emailNewCandidate, setEmailNewCandidate] = useState(true);
  const [emailStatusChange, setEmailStatusChange] = useState(true);
  const [emailInsights, setEmailInsights] = useState(false);
  const [inAppNotifs, setInAppNotifs] = useState(true);
  const [digestFreq, setDigestFreq] = useState('daily');

  // Mock API keys
  const [apiKeys] = useState([
    { id: '1', name: 'Production Key', key: 'sk_live_****abcd', created: '2025-01-15' },
    { id: '2', name: 'Development Key', key: 'sk_test_****efgh', created: '2025-02-20' },
  ]);

  const tabs = [
    { id: 'profile', label: t('settings.profile'), icon: User },
    { id: 'security', label: t('settings.security'), icon: Shield },
    { id: 'notifications', label: t('settings.notifications'), icon: Bell },
    { id: 'appearance', label: t('settings.appearance'), icon: Palette },
    { id: 'organization', label: t('settings.organization'), icon: Building2 },
    { id: 'data', label: t('settings.data_privacy'), icon: Database },
  ];

  return (
    <div>
      <PageHeader
        title={t('settings.title')}
        description={t('settings.description')}
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar Navigation */}
        <div className="w-full shrink-0 lg:w-56">
          <nav className="flex flex-col gap-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  activeTab === id
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                    : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]',
                )}
                onClick={() => setActiveTab(id)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Profile */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('settings.profile')}</CardTitle>
                <CardDescription>{t('settings.profile_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-2xl font-bold text-[hsl(var(--primary-foreground))]">
                    {user?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{user?.email}</p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="profile-name">{t('settings.name')}</Label>
                  <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="profile-email">{t('settings.email')}</Label>
                  <Input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('settings.role')}</Label>
                    <p className="mt-1 text-sm capitalize text-[hsl(var(--muted-foreground))]">{user?.role}</p>
                  </div>
                  <div>
                    <Label>{t('settings.org_id')}</Label>
                    <p className="mt-1 font-mono text-sm text-[hsl(var(--muted-foreground))]">{user?.organizationId}</p>
                  </div>
                </div>
                <Button>{t('settings.save_changes')}</Button>
              </CardContent>
            </Card>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('settings.change_password')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="current-pw">{t('settings.current_password')}</Label>
                    <Input id="current-pw" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="new-pw">{t('settings.new_password')}</Label>
                    <Input id="new-pw" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="confirm-pw">{t('settings.confirm_password')}</Label>
                    <Input id="confirm-pw" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
                  </div>
                  <Button>{t('settings.update_password')}</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('settings.active_sessions')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-3">
                    <div>
                      <p className="text-sm font-medium">Chrome on Linux</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">127.0.0.1 · {t('settings.current_session')}</p>
                    </div>
                    <Badge variant="success">{t('settings.current_session')}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('settings.two_factor')}</CardTitle>
                  <CardDescription>{t('settings.two_factor_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" disabled>{t('settings.enable_2fa')}</Button>
                  <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">{t('settings.coming_soon')}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('settings.email_notifications')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-candidates">{t('settings.email_candidates')}</Label>
                    <Switch id="email-candidates" checked={emailNewCandidate} onCheckedChange={setEmailNewCandidate} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-status">{t('settings.email_status')}</Label>
                    <Switch id="email-status" checked={emailStatusChange} onCheckedChange={setEmailStatusChange} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-insights">{t('settings.email_insights')}</Label>
                    <Switch id="email-insights" checked={emailInsights} onCheckedChange={setEmailInsights} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('settings.in_app_notifications')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="in-app-notifs">{t('settings.in_app_notifications')}</Label>
                    <Switch id="in-app-notifs" checked={inAppNotifs} onCheckedChange={setInAppNotifs} />
                  </div>
                  <div>
                    <Label>{t('settings.digest_frequency')}</Label>
                    <div className="mt-2 flex gap-2">
                      {(['daily', 'weekly', 'none'] as const).map((freq) => (
                        <button
                          key={freq}
                          className={cn(
                            'rounded-lg border px-4 py-2 text-sm transition-colors',
                            digestFreq === freq
                              ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                              : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]',
                          )}
                          onClick={() => setDigestFreq(freq)}
                        >
                          {t(`settings.${freq}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('settings.theme')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { value: 'light' as const, icon: Sun, label: t('settings.theme_light') },
                      { value: 'dark' as const, icon: Moon, label: t('settings.theme_dark') },
                      { value: 'system' as const, icon: Monitor, label: t('settings.theme_system') },
                    ]).map(({ value, icon: Icon, label }) => (
                      <button
                        key={value}
                        className={cn(
                          'flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors',
                          theme === value
                            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10'
                            : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]',
                        )}
                        onClick={() => setTheme(value)}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-sm font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('settings.language')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { value: 'en', label: 'English', flag: '🇺🇸' },
                      { value: 'ar', label: 'العربية', flag: '🇸🇦' },
                    ]).map(({ value, label, flag }) => (
                      <button
                        key={value}
                        className={cn(
                          'flex items-center gap-3 rounded-lg border p-4 transition-colors',
                          i18n.language === value
                            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10'
                            : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]',
                        )}
                        onClick={() => {
                          i18n.changeLanguage(value);
                          localStorage.setItem('sme-insightx-lang', value);
                          document.documentElement.setAttribute('dir', getDirection(value));
                          document.documentElement.setAttribute('lang', value);
                        }}
                      >
                        <span className="text-xl">{flag}</span>
                        <span className="text-sm font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Organization */}
          {activeTab === 'organization' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('settings.organization')}</CardTitle>
                  <CardDescription>{t('settings.organization_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="org-name">{t('settings.org_name')}</Label>
                    <Input id="org-name" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                  </div>
                  <div>
                    <Label>{t('settings.org_id')}</Label>
                    <p className="mt-1 font-mono text-sm text-[hsl(var(--muted-foreground))]">{user?.organizationId}</p>
                  </div>
                  <Button>{t('settings.save_changes')}</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('settings.members')}</CardTitle>
                  <CardDescription>{t('settings.members_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-xs font-medium text-[hsl(var(--primary-foreground))]">
                          {user?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user?.name}</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">{user?.email}</p>
                        </div>
                      </div>
                      <Badge variant="default" size="sm">{user?.role}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Data & Privacy */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('settings.export_data')}</CardTitle>
                  <CardDescription>{t('settings.export_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    {t('settings.export_button')}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('settings.api_keys')}</CardTitle>
                  <CardDescription>{t('settings.api_keys_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {apiKeys.map((k) => (
                    <div key={k.id} className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-3">
                      <div>
                        <p className="text-sm font-medium">{k.name}</p>
                        <p className="font-mono text-xs text-[hsl(var(--muted-foreground))]">{k.key}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    {t('settings.generate_key')}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('settings.integrations')}</CardTitle>
                  <CardDescription>{t('settings.integrations_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-dashed border-[hsl(var(--border))] p-8 text-center">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('settings.coming_soon')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
