import { Button } from '../ui/button';
import { Download, Trash2, Edit, X } from 'lucide-react';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onExport: () => void;
  onDelete: () => void;
  onChangeStatus: () => void;
  onClear: () => void;
}

export default function BulkActionsToolbar({
  selectedCount,
  onExport,
  onDelete,
  onChangeStatus,
  onClear
}: BulkActionsToolbarProps) {
  return (
    <div className="glass-panel border-border p-4 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-foreground font-semibold">
          {selectedCount} lead{selectedCount !== 1 ? 's' : ''} selected
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onChangeStatus}
            className="border-border"
          >
            <Edit className="w-4 h-4 mr-2" />
            Change Status
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onExport}
            className="border-border"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Selected
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={onClear}
      >
        <X className="w-4 h-4 mr-2" />
        Clear Selection
      </Button>
    </div>
  );
}
