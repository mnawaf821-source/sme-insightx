import { useState, useRef } from 'react';
import { WidgetCard } from './WidgetCard';
import { AddWidgetButton } from './AddWidgetButton';
import type { Widget } from '../api/dashboard.api';

interface DashboardGridProps {
  widgets: Widget[];
  onAddWidget: () => void;
  onEditWidget: (widget: Widget) => void;
  onDeleteWidget: (widgetId: string) => void;
  onReorderWidgets?: (reordered: { id: string; position: { x: number; y: number; w: number; h: number } }[]) => void;
  isLoading?: boolean;
}

export function DashboardGrid({
  widgets,
  onAddWidget,
  onEditWidget,
  onDeleteWidget,
  onReorderWidgets,
  isLoading,
}: DashboardGridProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder
    const reordered = [...widgets];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(dropIndex, 0, moved);

    // Update positions
    if (onReorderWidgets) {
      const updates = reordered.map((w, i) => ({
        id: w.id,
        position: { ...w.position, x: i },
      }));
      onReorderWidgets(updates);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

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
      {widgets.map((widget, index) => (
        <div
          key={widget.id}
          className={`min-h-[280px] transition-all ${
            draggedIndex === index ? 'opacity-40 scale-95' : ''
          } ${
            dragOverIndex === index && draggedIndex !== index
              ? 'ring-2 ring-[hsl(var(--primary))] ring-offset-2 rounded-lg'
              : ''
          }`}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
        >
          <WidgetCard
            widget={widget}
            onDelete={() => onDeleteWidget(widget.id)}
            onEdit={() => onEditWidget(widget)}
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
