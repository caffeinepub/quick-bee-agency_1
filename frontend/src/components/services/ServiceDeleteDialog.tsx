import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { useDeleteService } from '../../hooks/useQueries';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { Service } from '../../backend';

interface ServiceDeleteDialogProps {
  service: Service;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function ServiceDeleteDialog({ service, open, onOpenChange, onSuccess }: ServiceDeleteDialogProps) {
  const deleteService = useDeleteService();

  const handleDelete = async () => {
    try {
      await deleteService.mutateAsync(service.id);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Failed to delete service:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Delete Service
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this service? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            You are about to delete:
          </p>
          <p className="text-lg font-semibold mt-2">{service.name}</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleteService.isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteService.isPending}
          >
            {deleteService.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Delete Service
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
