"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"

// Form validation schema
const producerSchema = z.object({
  feedTitle: z.string().min(1, "Feed title is required").max(50, "Title too long"),
  feedUrl: z.string().url("Please enter a valid RSS URL"),
  categoryId: z.string().min(1, "Please select a category"),
  refreshInterval: z.coerce.number().min(15, "Minimum 15 minutes").max(1440, "Maximum 24 hours")
})

type ProducerFormData = z.infer<typeof producerSchema>

interface CreateProducerModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateProducerModal({ isOpen, onClose }: CreateProducerModalProps) {
  const categories = useQuery(api.categories.getAllCategories)
  const createProducer = useMutation(api.rssProducer.createProducer)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<ProducerFormData>({
    resolver: zodResolver(producerSchema),
    defaultValues: {
      feedTitle: "",
      feedUrl: "",
      categoryId: "",
      refreshInterval: 30,
    },
  })

  const handleSubmit = async (data: ProducerFormData) => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)
      
      await createProducer({
        name: data.feedTitle,
        url: data.feedUrl,
        categoryId: data.categoryId as any, // Convex ID type
        isActive: true,
        pollFrequency: data.refreshInterval,
        numberOfArticles: 10, // Default value
      })
      
      // Success - reset form and close modal
      form.reset()
      onClose()
    } catch (error) {
      console.error('Failed to create producer:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to create producer')
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
      <DialogContent className="bg-brand-card border-zinc-700 max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-700">
          <DialogTitle className="text-headline-primary text-lg font-medium">
            Create Producer
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0 text-zinc-400 hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
          {/* Error Message */}
          {submitError && (
            <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded p-2">
              {submitError}
            </div>
          )}
          
          {/* Feed Title */}
          <div className="space-y-2">
            <Label htmlFor="feedTitle" className="text-body-primary text-sm">
              Feed Title
            </Label>
            <Input
              id="feedTitle"
              placeholder="e.g. TechCrunch AI News"
              className="bg-brand-background border-zinc-600 text-headline-primary placeholder:text-zinc-500"
              {...form.register("feedTitle")}
            />
            {form.formState.errors.feedTitle && (
              <p className="text-sm text-red-500">{form.formState.errors.feedTitle.message}</p>
            )}
          </div>

          {/* Feed URL */}
          <div className="space-y-2">
            <Label htmlFor="feedUrl" className="text-body-primary text-sm">
              Feed URL
            </Label>
            <Input
              id="feedUrl"
              placeholder="https://techcrunch.com/feed/"
              className="bg-brand-background border-zinc-600 text-headline-primary placeholder:text-zinc-500"
              {...form.register("feedUrl")}
            />
            {form.formState.errors.feedUrl && (
              <p className="text-sm text-red-500">{form.formState.errors.feedUrl.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-body-primary text-sm">
              Category
            </Label>
            <Select onValueChange={(value) => form.setValue("categoryId", value)} value={form.watch("categoryId")}>
              <SelectTrigger className="bg-brand-background border-zinc-600 text-headline-primary w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-brand-card border-zinc-700 w-full">
                {categories?.map((category) => (
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

          {/* Refresh Interval */}
          <div className="space-y-2">
            <Label htmlFor="refreshInterval" className="text-body-primary text-sm">
              Refresh Interval
            </Label>
            <Select onValueChange={(value) => form.setValue("refreshInterval", parseInt(value))} value={form.watch("refreshInterval")?.toString()}>
              <SelectTrigger className="bg-brand-background border-zinc-600 text-headline-primary w-full">
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent className="bg-brand-card border-zinc-700 w-full">
                <SelectItem value="15" className="text-body-greyed-out hover:text-headline-primary focus:text-headline-primary">15 minutes</SelectItem>
                <SelectItem value="30" className="text-body-greyed-out hover:text-headline-primary focus:text-headline-primary">30 minutes</SelectItem>
                <SelectItem value="45" className="text-body-greyed-out hover:text-headline-primary focus:text-headline-primary">45 minutes</SelectItem>
                <SelectItem value="60" className="text-body-greyed-out hover:text-headline-primary focus:text-headline-primary">60 minutes</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.refreshInterval && (
              <p className="text-sm text-red-500">{form.formState.errors.refreshInterval.message}</p>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-center pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}