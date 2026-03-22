import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart3, Users, FileText, TrendingUp } from 'lucide-react';

const stats = [
  { title: 'Total Data Sources', value: '12', icon: FileText, change: '+2 this week' },
  { title: 'Active Dashboards', value: '5', icon: BarChart3, change: '+1 this month' },
  { title: 'Open Positions', value: '3', icon: Users, change: '2 new candidates' },
  { title: 'AI Insights', value: '24', icon: TrendingUp, change: '8 unread' },
];

export function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your business data and activities"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ title, value, icon: Icon, change }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                {title}
              </CardTitle>
              <Icon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              No recent activity yet. Upload your first data file to get started.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              📊 Upload data file to create a dashboard
            </p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              👥 Create a new job posting
            </p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              💡 Ask the AI assistant for insights
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
