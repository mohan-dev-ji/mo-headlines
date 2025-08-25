"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TimecodeInput } from "@/components/ui/timecode-input"
import { X } from "lucide-react"
import { useQuery, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { timecodeToSeconds } from "@/lib/timecode-utils"

const youtubeSchema = z.object({
  videoUrl: z.string()
    .min(1, "YouTube URL is required")
    .refine((url) => {
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /^[a-zA-Z0-9_-]{11}$/ // Direct video ID
      ];
      return patterns.some(pattern => pattern.test(url));
    }, "Please enter a valid YouTube URL or video ID"),
  videoTitle: z.string().min(1, "Video title is required").max(200, "Title too long"),
  categoryId: z.string().min(1, "Please select a category"),
  timecodeStart: z.string().optional(),
  timecodeEnd: z.string().optional()
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

type YouTubeFormData = z.infer<typeof youtubeSchema>

interface CreateYouTubeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateYouTubeModal({ isOpen, onClose }: CreateYouTubeModalProps) {
  const { user } = useUser()
  const categories = useQuery(api.categories.getAllCategories)
  const extractYouTubeData = useAction(api.createYoutube.extractYouTubeData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<YouTubeFormData>({
    resolver: zodResolver(youtubeSchema),
    defaultValues: {
      videoUrl: "",
      videoTitle: "",
      categoryId: "",
      timecodeStart: "",
      timecodeEnd: "",
    },
  })

  const handleSubmit = async (data: YouTubeFormData) => {
    if (!user) {
      setSubmitError('You must be logged in to create YouTube sources')
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitError(null)
      
      const result = await extractYouTubeData({
        videoUrl: data.videoUrl,
        videoTitle: data.videoTitle,
        categoryId: data.categoryId as any,
        timecodeStart: data.timecodeStart ? timecodeToSeconds(data.timecodeStart) : undefined,
        timecodeEnd: data.timecodeEnd ? timecodeToSeconds(data.timecodeEnd) : undefined,
      })
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      form.reset()
      onClose()
    } catch (error) {
      console.error('Failed to create YouTube source:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to create YouTube source')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    form.reset()
    setSubmitError(null)
    onClose()
  }


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-brand-card border-brand-line max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-brand-line">
          <DialogTitle className="text-headline-primary text-lg font-medium">
            Create YouTube Source
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
          
          <div className="space-y-2">
            <Label htmlFor="videoUrl" className="text-body-primary text-sm">
              YouTube URL or Video ID
            </Label>
            <Input
              id="videoUrl"
              placeholder="https://www.youtube.com/watch?v=... or video ID"
              className="bg-brand-background border-brand-line text-headline-primary placeholder:text-zinc-500"
              {...form.register("videoUrl")}
            />
            {form.formState.errors.videoUrl && (
              <p className="text-sm text-red-500">{form.formState.errors.videoUrl.message}</p>
            )}
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="category" className="text-body-primary text-sm">
              Category
            </Label>
            <Select onValueChange={(value) => form.setValue("categoryId", value)} value={form.watch("categoryId")}>
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

          <div className="space-y-3">
            <Label className="text-body-primary text-sm">
              Timecode Range <span className="text-body-secondary">(optional - extract specific segment)</span>
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
            
            <p className="text-xs text-body-secondary">
              Leave blank to extract full transcript. Specify range to extract only that segment.
            </p>
          </div>

          <div className="flex justify-center pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Extracting Transcript..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}