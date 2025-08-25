"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TimecodeInput } from "@/components/ui/timecode-input"
import { X } from "lucide-react"
import { useQuery, useAction, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState, useEffect } from "react"
import { Id } from "@/convex/_generated/dataModel"
import { timecodeToSeconds, secondsToTimecode } from "@/lib/timecode-utils"

const youtubeEditSchema = z.object({
  videoTitle: z.string().min(1, "Video title is required").max(200, "Title too long"),
  timecodeStart: z.string().optional(),
  timecodeEnd: z.string().optional(),
  categoryId: z.string().min(1, "Please select a category")
}).refine((data) => {
  const startSeconds = data.timecodeStart ? timecodeToSeconds(data.timecodeStart) : 0;
  const endSeconds = data.timecodeEnd ? timecodeToSeconds(data.timecodeEnd) : 0;
  
  if (data.timecodeStart && data.timecodeEnd && startSeconds > 0 && endSeconds > 0) {
    return endSeconds > startSeconds;
  }
  return true;
}, {
  message: "End time must be greater than start time",
  path: ["timecodeEnd"]
});

type YouTubeEditFormData = z.infer<typeof youtubeEditSchema>

interface YouTubeSource {
  _id: Id<"create_youtube">
  videoUrl: string
  videoTitle?: string
  transcript: string
  categoryId: Id<"categories">
  timecodeStart?: number
  timecodeEnd?: number
  createdBy: Id<"users">
  updatedAt?: number
  categoryName?: string
}

interface EditYouTubeModalProps {
  isOpen: boolean
  onClose: () => void
  source: YouTubeSource | null
}

export function EditYouTubeModal({ isOpen, onClose, source }: EditYouTubeModalProps) {
  const categories = useQuery(api.categories.getAllCategories)
  const updateYouTubeTranscript = useAction(api.createYoutube.updateYouTubeTranscript)
  const updateYouTubeTitle = useMutation(api.createYoutube.updateYouTubeTitle)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isRegeneratingTranscript, setIsRegeneratingTranscript] = useState(false)

  const form = useForm<YouTubeEditFormData>({
    resolver: zodResolver(youtubeEditSchema),
    defaultValues: {
      videoTitle: "",
      timecodeStart: "",
      timecodeEnd: "",
      categoryId: "",
    },
  })

  useEffect(() => {
    if (source && isOpen) {
      form.reset({
        videoTitle: source.videoTitle || "",
        timecodeStart: source.timecodeStart ? secondsToTimecode(source.timecodeStart) : "",
        timecodeEnd: source.timecodeEnd ? secondsToTimecode(source.timecodeEnd) : "",
        categoryId: source.categoryId,
      })
    }
  }, [source, isOpen, form])

  const handleRegenerateTranscript = async () => {
    if (!source) return;

    try {
      setIsRegeneratingTranscript(true)
      setSubmitError(null)
      
      const data = form.getValues()
      
      const result = await updateYouTubeTranscript({
        youtubeId: source._id,
        timecodeStart: data.timecodeStart ? timecodeToSeconds(data.timecodeStart) : undefined,
        timecodeEnd: data.timecodeEnd ? timecodeToSeconds(data.timecodeEnd) : undefined,
      })
      
      if (!result.success) {
        throw new Error(result.error)
      }

      // Close modal after successful regeneration
      onClose()
    } catch (error) {
      console.error('Failed to regenerate transcript:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to regenerate transcript')
    } finally {
      setIsRegeneratingTranscript(false)
    }
  }

  const handleSubmit = async (data: YouTubeEditFormData) => {
    if (!source) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Update video title if changed
      if (data.videoTitle !== source.videoTitle) {
        await updateYouTubeTitle({
          youtubeId: source._id,
          videoTitle: data.videoTitle,
        });
      }

      // Update transcript with new timecodes
      const result = await updateYouTubeTranscript({
        youtubeId: source._id,
        timecodeStart: data.timecodeStart ? timecodeToSeconds(data.timecodeStart) : undefined,
        timecodeEnd: data.timecodeEnd ? timecodeToSeconds(data.timecodeEnd) : undefined,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      onClose();
    } catch (error) {
      console.error('Failed to update YouTube source:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to update YouTube source');
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleClose = () => {
    form.reset()
    setSubmitError(null)
    onClose()
  }

  if (!source) return null

  const formatTimecode = (seconds?: number): string => {
    if (!seconds) return "Not set";
    return secondsToTimecode(seconds);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-brand-card border-brand-line max-w-lg">
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-brand-line">
          <DialogTitle className="text-headline-primary text-lg font-medium">
            Edit YouTube Source
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0 text-headline-primary hover:text-brand-card-dark"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
          {submitError && (
            <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded p-2">
              {submitError}
            </div>
          )}
          
          {/* Video Info Display */}
          <div className="space-y-2 p-3 bg-brand-background rounded border border-brand-line">
            <div className="text-sm font-medium text-headline-primary">
              {source.videoTitle || "YouTube Video"}
            </div>
            <div className="text-xs text-body-secondary break-all">
              {source.videoUrl}
            </div>
            <div className="text-xs text-body-secondary">
              Current timecodes: {formatTimecode(source.timecodeStart)} - {formatTimecode(source.timecodeEnd)}
            </div>
          </div>

          {/* Edit Video Title */}
          <div className="space-y-2">
            <Label htmlFor="videoTitle" className="text-body-primary text-sm">
              Video Title
            </Label>
            <Input
              id="videoTitle"
              placeholder="Enter a descriptive title for this video"
              className="bg-brand-background border-brand-line text-headline-primary placeholder:text-zinc-500"
              {...form.register("videoTitle")}
            />
            {form.formState.errors.videoTitle && (
              <p className="text-sm text-red-500">{form.formState.errors.videoTitle.message}</p>
            )}
          </div>

          {/* Current Transcript Preview */}
          <div className="space-y-2">
            <Label className="text-body-primary text-sm">
              Current Transcript Segment
            </Label>
            <Textarea
              value={source.transcript}
              readOnly
              className="bg-brand-background border-brand-line text-headline-primary min-h-[100px] resize-none text-sm"
            />
          </div>

          {/* Timecode Update */}
          <div className="space-y-3">
            <Label className="text-body-primary text-sm">
              Update Timecode Range
            </Label>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="timecodeStart" className="text-xs text-body-secondary">
                  Start (HH:MM:SS)
                </Label>
                <TimecodeInput
                  id="timecodeStart"
                  placeholder="00:00:00"
                  className="bg-brand-background border-brand-line text-headline-primary placeholder:text-zinc-500"
                  value={form.watch("timecodeStart")}
                  onChange={(value) => form.setValue("timecodeStart", value)}
                />
                {form.formState.errors.timecodeStart && (
                  <p className="text-xs text-red-500">{form.formState.errors.timecodeStart.message}</p>
                )}
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="timecodeEnd" className="text-xs text-body-secondary">
                  End (HH:MM:SS)
                </Label>
                <TimecodeInput
                  id="timecodeEnd"
                  placeholder="00:00:00"
                  className="bg-brand-background border-brand-line text-headline-primary placeholder:text-zinc-500"
                  value={form.watch("timecodeEnd")}
                  onChange={(value) => form.setValue("timecodeEnd", value)}
                />
                {form.formState.errors.timecodeEnd && (
                  <p className="text-xs text-red-500">{form.formState.errors.timecodeEnd.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Category Update */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-body-primary text-sm">
              Category
            </Label>
            <Select 
              onValueChange={(value) => form.setValue("categoryId", value)} 
              value={form.watch("categoryId")}
            >
              <SelectTrigger className="bg-brand-background border-brand-line text-headline-primary w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-brand-card border-brand-line w-full">
                {categories?.map((category: any) => (
                  <SelectItem 
                    key={category._id} 
                    value={category._id} 
                    className="text-body-greyed-out hover:text-headline-primary focus:text-headline-primary"
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.categoryId && (
              <p className="text-sm text-red-500">{form.formState.errors.categoryId.message}</p>
            )}
          </div>

          <div className="flex justify-center space-x-3 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting || isRegeneratingTranscript}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegeneratingTranscript ? "Regenerating..." : "Update & Regenerate Transcript"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}