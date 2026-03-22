import { WidgetCard } from './WidgetCard';
import { AddWidgetButton } from './AddWidgetButton';
import type { Widget } from '../api/dashboard.api';

interface DashboardGridProps {
  widgets: Widget[];
  onAddWidget: () => void;
  onDeleteWidget: (widgetId: string) => void;
  isLoading?: boolean;
}

export function DashboardGrid({
  widgets,
  onAddWidget,
  onDeleteWidget,
  isLoading,
}: DashboardGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {widgets.map((widget) => (
        <div
          key={widget.id}
          className="min-h-[280px]"
          style={{
            gridColumn: `span ${Math.min(widget.position?.w || 6, 6)} / span ${Math.min(widget.position?.w || 6, 6)}`,
          }}
        >
          <WidgetCard
            widget={widget}
            onDelete={() => onDeleteWidget(widget.id)}
          />
        </div>
      ))}

      {/* Add Widget Card */}
      <div className="min-h-[280px]">
        <AddWidgetButton onClick={onAddWidget} />
      </div>
    </div>
  );
}
