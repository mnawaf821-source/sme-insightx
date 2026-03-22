import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

export function HRPage() {
  return (
    <div>
      <PageHeader
        title="HR Assistant"
        description="Manage recruitment with AI-powered tools"
        actions={<Button>Post New Job</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Job Postings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              No active job postings. Create one to start receiving candidates.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Candidates will appear here once you have active job postings.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
