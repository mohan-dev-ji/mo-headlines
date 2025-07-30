"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Power, 
  PowerOff, 
  ExternalLink,
  Zap,
  Clock
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { refreshIntervalOptions } from "@/lib/validations/rss";

interface RSSSourceCardProps {
  source: Doc<"rss_sources">;
  onEdit?: (source: Doc<"rss_sources">) => void;
}

export function RSSSourceCard({ source, onEdit }: RSSSourceCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const toggleStatus = useMutation(api.rssSources.toggleSourceStatus);
  const deleteSource = useMutation(api.rssSources.deleteRSSSource);

  const refreshIntervalLabel = refreshIntervalOptions.find(
    opt => opt.seconds === source.pollFrequency
  )?.label || "Unknown";

  const handleToggleStatus = async () => {
    setIsToggling(true);
    try {
      await toggleStatus({
        id: source._id,
        isActive: !source.isActive,
      });
    } catch (error) {
      console.error("Error toggling source status:", error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSource({ id: source._id });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting source:", error);
    }
  };

  const formatLastPolled = (timestamp?: number) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Less than an hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  return (
    <>
      <Card className="bg-brand-card border-brand-line hover:bg-brand-card-dark transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-headline-4 text-headline-primary font-medium truncate">
                  {source.name}
                </h3>
                <Badge 
                  variant={source.isActive ? "default" : "secondary"}
                  className={
                    source.isActive 
                      ? "bg-indicator-approved text-button-white" 
                      : "bg-indicator-pending text-button-white"
                  }
                >
                  {source.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-caption text-body-secondary mb-2">
                <ExternalLink className="h-3 w-3" />
                <span className="truncate">{source.url}</span>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-body-secondary hover:text-headline-primary">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(source)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleStatus} disabled={isToggling}>
                  {source.isActive ? (
                    <>
                      <PowerOff className="mr-2 h-4 w-4" />
                      Disable
                    </>
                  ) : (
                    <>
                      <Power className="mr-2 h-4 w-4" />
                      Enable
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-error focus:text-error"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 text-caption text-body-greyed-out mb-4">
            <div className="flex items-center gap-1">
              <span className="font-medium">Category:</span>
              <span>{source.category}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{refreshIntervalLabel}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">Articles:</span>
              <span>{source.numberOfArticles}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">Last polled:</span>
              <span>{formatLastPolled(source.lastPolled)}</span>
            </div>
          </div>

          {source.goldenArticleTitle && (
            <div className="bg-brand-background border border-brand-line rounded p-3 mb-4">
              <p className="text-caption text-body-secondary mb-1">Golden Article:</p>
              <p className="text-body-sm text-headline-primary font-medium line-clamp-2">
                {source.goldenArticleTitle}
              </p>
            </div>
          )}

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              className="text-body-secondary hover:text-headline-primary"
              onClick={() => window.open(source.url, '_blank')}
            >
              <ExternalLink className="mr-2 h-3 w-3" />
              View Feed
            </Button>
            
            {source.isActive && (
              <Button
                size="sm"
                className="bg-brand-primary-button hover:bg-brand-primary-button-hover"
              >
                <Zap className="mr-2 h-3 w-3" />
                Research & Generate
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-brand-card border-brand-line">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-headline-primary">Delete RSS Source</AlertDialogTitle>
            <AlertDialogDescription className="text-body-secondary">
              Are you sure you want to delete "{source.name}"? This action cannot be undone and will also delete all associated RSS items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-body-secondary">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-error hover:bg-error/90 text-button-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}