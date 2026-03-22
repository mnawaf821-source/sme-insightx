import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/button';
import { DashboardGrid } from '../features/dashboard/components/DashboardGrid';
import { AddWidgetModal } from '../features/dashboard/components/AddWidgetModal';
import {
  useDashboards,
  useDashboard,
  useCreateDashboard,
  useDeleteDashboard,
  useAddWidget,
  useDeleteWidget,
} from '../features/dashboard/hooks/useDashboard';
import type { WidgetConfig } from '../features/dashboard/api/dashboard.api';

export function DashboardPage() {
  const [selectedDashboardId, setSelectedDashboardId] = useState<string | null>(null);
  const [showAddWidget, setShowAddWidget] = useState(false);

  const { data: dashboards, isLoading: loadingList } = useDashboards();
  const { data: selectedDashboard, isLoading: loadingDashboard } = useDashboard(
    selectedDashboardId || undefined,
  );
  const createDashboard = useCreateDashboard();
  const deleteDashboard = useDeleteDashboard();
  const addWidget = useAddWidget(selectedDashboardId || '');
  const deleteWidget = useDeleteWidget(selectedDashboardId || '');

  const handleCreateDashboard = async () => {
    const name = prompt('Dashboard name:');
    if (!name) return;
    const result = await createDashboard.mutateAsync({ name });
    setSelectedDashboardId(result.id);
  };

  const handleAddWidget = (data: {
    type: 'chart' | 'table' | 'metric' | 'text';
    title: string;
    config: WidgetConfig;
    position: { x: number; y: number; w: number; h: number };
  }) => {
    addWidget.mutate(data);
    setShowAddWidget(false);
  };

  const handleDeleteWidget = (widgetId: string) => {
    if (confirm('Delete this widget?')) {
      deleteWidget.mutate(widgetId);
    }
  };

  const handleDeleteDashboard = () => {
    if (!selectedDashboardId) return;
    if (confirm(`Delete "${selectedDashboard?.name}"?`)) {
      deleteDashboard.mutate(selectedDashboardId);
      setSelectedDashboardId(null);
    }
  };

  // If no dashboards exist, show create prompt
  if (!loadingList && dashboards?.length === 0) {
    return (
      <div>
        <PageHeader
          title="Dashboard"
          description="Create visualizations from your data"
        />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-[hsl(var(--muted))] p-4">
            <svg
              className="h-10 w-10 text-[hsl(var(--muted-foreground))]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
              />
            </svg>
          </div>
          <h3 className="mb-1 text-lg font-medium">No dashboards yet</h3>
          <p className="mb-4 text-sm text-[hsl(var(--muted-foreground))]">
            Create your first dashboard to start visualizing data
          </p>
          <Button onClick={handleCreateDashboard}>Create Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={
          selectedDashboard?.name
            ? `Viewing: ${selectedDashboard.name}`
            : 'Create visualizations from your data'
        }
      />

      {/* Dashboard selector + actions */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <select
          className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
          value={selectedDashboardId || ''}
          onChange={(e) => setSelectedDashboardId(e.target.value || null)}
        >
          <option value="">Select a dashboard...</option>
          {dashboards?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <Button variant="outline" size="sm" onClick={handleCreateDashboard}>
          New Dashboard
        </Button>

        {selectedDashboardId && (
          <>
            <Button size="sm" onClick={() => setShowAddWidget(true)}>
              Add Widget
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600"
              onClick={handleDeleteDashboard}
            >
              Delete Dashboard
            </Button>
          </>
        )}
      </div>

      {/* Dashboard content */}
      {selectedDashboardId ? (
        <DashboardGrid
          widgets={selectedDashboard?.widgets ?? []}
          onAddWidget={() => setShowAddWidget(true)}
          onDeleteWidget={handleDeleteWidget}
          isLoading={loadingDashboard}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Select a dashboard above or create a new one
          </p>
        </div>
      )}

      {/* Add Widget Modal */}
      {showAddWidget && (
        <AddWidgetModal
          onAdd={handleAddWidget}
          onClose={() => setShowAddWidget(false)}
        />
      )}
    </div>
  );
}
