"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPromptCreated?: (promptId: Id<"prompts">, promptText?: string) => void;
  articleId: Id<"articles">;
  mode: "create" | "edit";
  initialPrompt?: string;
  originalPromptId?: Id<"prompts">;
}

interface PromptRowData {
  id?: Id<"prompts">;
  text: string;
  isSelected: boolean;
  isEditing: boolean;
  isNew?: boolean;
}

export function PromptModal({
  isOpen,
  onClose,
  onPromptCreated,
  articleId,
  mode,
  initialPrompt = "",
  originalPromptId,
}: PromptModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch existing prompts
  const existingPrompts = useQuery(
    api.prompts.getPromptsForArticle, 
    articleId !== "test-article-id" ? { articleId } : "skip"
  );

  // Initialize prompt rows from existing prompts or create new one
  const [promptRows, setPromptRows] = useState<PromptRowData[]>(() => {
    if (mode === "create" || !existingPrompts) {
      return [{
        text: initialPrompt,
        isSelected: true,
        isEditing: true,
        isNew: true
      }];
    }
    
    return existingPrompts.map(prompt => ({
      id: prompt._id,
      text: prompt.prompt,
      isSelected: prompt._id === originalPromptId,
      isEditing: false,
      isNew: false
    }));
  });

  const createCustomPrompt = useMutation(api.prompts.createCustomPrompt);
  const createStandalonePrompt = useMutation(api.prompts.createStandalonePrompt);
  const editPrompt = useMutation(api.prompts.editPrompt);

  const handleRowTextChange = (index: number, newText: string) => {
    setPromptRows(prev => prev.map((row, i) => 
      i === index ? { ...row, text: newText } : row
    ));
  };

  const handleRowSelectionChange = (index: number, isSelected: boolean) => {
    setPromptRows(prev => prev.map((row, i) => 
      i === index ? { ...row, isSelected } : { ...row, isSelected: false }
    ));
  };

  const handleRowEditToggle = (index: number) => {
    setPromptRows(prev => prev.map((row, i) => 
      i === index ? { ...row, isEditing: !row.isEditing } : row
    ));
  };

  const handleCreateNew = () => {
    setPromptRows(prev => [...prev, {
      text: "",
      isSelected: false,
      isEditing: true,
      isNew: true
    }]);
  };

  const handleSubmit = async () => {
    const selectedRows = promptRows.filter(row => row.isSelected);
    
    if (selectedRows.length === 0) {
      toast.error("Please select at least one prompt");
      return;
    }

    setIsSubmitting(true);
    
    try {
      for (const row of selectedRows) {
        if (!row.text.trim()) continue;
        
        let result;
        
        if (row.isNew) {
          // Check if this is gallery context (test article ID)
          if (articleId === "test-article-id") {
            result = await createStandalonePrompt({
              prompt: row.text.trim(),
            });
          } else {
            result = await createCustomPrompt({
              articleId,
              prompt: row.text.trim(),
            });
          }
        } else if (row.id) {
          result = await editPrompt({
            originalPromptId: row.id,
            newPromptText: row.text.trim(),
          });
        }
        
        if (result) {
          onPromptCreated?.(result.promptId, row.text.trim());
        }
      }

      toast.success("Prompts saved successfully");
      handleClose();
    } catch (error) {
      console.error("Error saving prompts:", error);
      toast.error(
        `Failed to save prompts: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] bg-brand-card border-brand-line max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-body-primary">Prompt Editor</DialogTitle>
          <DialogDescription className="text-body-secondary">
            Select and edit prompts for image generation. Check the prompts you want to use.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {promptRows.map((row, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border border-brand-line rounded-lg bg-brand-background">
              {/* Checkbox */}
              <Checkbox
                checked={row.isSelected}
                onCheckedChange={(checked) => handleRowSelectionChange(index, !!checked)}
                className="mt-1"
              />
              
              {/* Textarea */}
              <Textarea
                value={row.text}
                onChange={(e) => handleRowTextChange(index, e.target.value)}
                placeholder="Enter your image generation prompt..."
                className="flex-1 min-h-[80px] bg-transparent border-none p-0 text-body-primary placeholder:text-body-tertiary resize-none focus:ring-0"
                readOnly={!row.isEditing}
              />
              
              {/* Edit Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRowEditToggle(index)}
                className="flex-shrink-0 bg-white hover:bg-gray-50 text-gray-900 border-gray-300"
              >
                {row.isEditing ? "Done" : "Edit"}
              </Button>
            </div>
          ))}
          
          {/* Create New Button */}
          <Button
            variant="outline"
            onClick={handleCreateNew}
            className="w-full border-dashed border-brand-line text-body-secondary hover:text-body-primary hover:bg-brand-surface"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="border-brand-line text-body-secondary hover:text-body-primary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}