import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAuthStore } from '../stores/authStore';

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your account and organization preferences"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm font-medium">Name:</span>{' '}
              <span className="text-sm text-[hsl(var(--muted-foreground))]">
                {user?.name}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium">Email:</span>{' '}
              <span className="text-sm text-[hsl(var(--muted-foreground))]">
                {user?.email}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium">Role:</span>{' '}
              <span className="text-sm capitalize text-[hsl(var(--muted-foreground))]">
                {user?.role}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <span className="text-sm font-medium">ID:</span>{' '}
              <span className="text-sm font-mono text-[hsl(var(--muted-foreground))]">
                {user?.organizationId}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
