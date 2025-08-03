"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface BulkDeleteDialogProps {
  isOpen: boolean
  selectedCount: number
  isLoading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function BulkDeleteDialog({
  isOpen,
  selectedCount,
  isLoading,
  onConfirm,
  onCancel
}: BulkDeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onCancel()}>
      <AlertDialogContent className="bg-brand-card-dark border-brand-line-dark">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-headline-primary">
            Delete Selected Articles
          </AlertDialogTitle>
          <AlertDialogDescription className="text-body-primary">
            Are you sure you want to delete {selectedCount} selected article{selectedCount === 1 ? '' : 's'} from the queue? 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            disabled={isLoading}
            className="bg-brand-card border-brand-line text-body-primary hover:bg-brand-card-dark hover:text-headline-primary"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-error-red text-white hover:bg-red-700 focus:ring-red-500"
          >
            {isLoading ? 'Deleting...' : `Delete ${selectedCount} Article${selectedCount === 1 ? '' : 's'}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}