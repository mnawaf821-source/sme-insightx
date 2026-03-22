import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Explore your data with AI-powered visualizations"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data Files</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              No data files uploaded yet. Upload a CSV, Excel, or JSON file to begin.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Upload data to receive automated trend analysis and anomaly detection.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
