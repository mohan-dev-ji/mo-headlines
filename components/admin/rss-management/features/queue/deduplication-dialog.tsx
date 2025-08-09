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
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface DuplicateArticle {
  _id: string
  title: string
  producer?: {
    name: string
  }
  _creationTime: number
}

interface DeduplicationDialogProps {
  isOpen: boolean
  articlesToDelete: DuplicateArticle[]
  isLoading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeduplicationDialog({
  isOpen,
  articlesToDelete,
  isLoading,
  onConfirm,
  onCancel
}: DeduplicationDialogProps) {
  const deleteCount = articlesToDelete.length

  if (deleteCount === 0) {
    return (
      <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onCancel()}>
        <AlertDialogContent className="bg-brand-card-dark border-brand-line-dark">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-headline-primary">
              No Duplicates Found
            </AlertDialogTitle>
            <AlertDialogDescription className="text-body-primary">
              No duplicate articles were found among the selected items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isLoading}
              className="bg-brand-card border-brand-line text-body-primary hover:bg-brand-card-dark hover:text-headline-primary"
            >
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onCancel()}>
      <AlertDialogContent className="bg-brand-card-dark border-brand-line-dark max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-headline-primary">
            Remove Duplicate Articles
          </AlertDialogTitle>
          <AlertDialogDescription className="text-body-primary">
            Found {deleteCount} duplicate article{deleteCount === 1 ? '' : 's'} to remove. The most recent version of each story will be kept.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-96">
          <div className="text-sm text-body-primary font-medium mb-2">
            Articles to be deleted:
          </div>
          {articlesToDelete.map((article) => (
            <div key={article._id} className="bg-brand-card rounded-lg p-3 space-y-2">
              <div className="font-medium text-headline-primary line-clamp-2">
                {article.title}
              </div>
              <div className="flex items-center gap-2 text-sm text-body-greyed-out">
                {article.producer && (
                  <Badge variant="outline" className="text-xs">
                    {article.producer.name}
                  </Badge>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {article._creationTime && !isNaN(article._creationTime) 
                      ? formatDistanceToNow(new Date(article._creationTime), { addSuffix: true })
                      : 'Unknown time'
                    }
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <AlertDialogFooter className="mt-4">
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
            {isLoading ? 'Removing...' : `Remove ${deleteCount} Duplicate${deleteCount === 1 ? '' : 's'}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}