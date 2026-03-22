import { Plus } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';

interface AddWidgetButtonProps {
  onClick: () => void;
}

export function AddWidgetButton({ onClick }: AddWidgetButtonProps) {
  return (
    <Card
      className="flex h-full min-h-[280px] cursor-pointer items-center justify-center border-dashed transition-colors hover:border-[hsl(var(--primary))]/50 hover:bg-[hsl(var(--muted))]/30"
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center gap-2 p-6">
        <div className="rounded-full bg-[hsl(var(--muted))] p-3">
          <Plus className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
        </div>
        <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
          Add Widget
        </p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]/70">
          Chart, table, metric, or text
        </p>
      </CardContent>
    </Card>
  );
}
