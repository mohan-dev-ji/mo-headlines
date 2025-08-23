"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState, useEffect } from "react"
import { Id } from "@/convex/_generated/dataModel"

const researchSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  concept: z.string().min(1, "Research concept is required").max(500, "Concept too long"),
  categoryId: z.string().min(1, "Please select a category")
})

type ResearchFormData = z.infer<typeof researchSchema>

interface Source {
  _id: Id<"create_research">
  title: string
  url?: string
  concept: string
  categoryId?: Id<"categories">
  createdBy: Id<"users">
  updatedAt?: number
}

interface EditResearchModalProps {
  isOpen: boolean
  onClose: () => void
  source: Source | null
}

export function EditResearchModal({ isOpen, onClose, source }: EditResearchModalProps) {
  const categories = useQuery(api.categories.getAllCategories)
  const updateSource = useMutation(api.createResearch.updateResearchSource)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<ResearchFormData>({
    resolver: zodResolver(researchSchema),
    defaultValues: {
      title: "",
      url: "",
      concept: "",
      categoryId: "",
    },
  })

  useEffect(() => {
    if (source && isOpen) {
      form.reset({
        title: source.title,
        url: source.url || "",
        concept: source.concept,
        categoryId: source.categoryId || "",
      })
    }
  }, [source, isOpen, form])

  const handleSubmit = async (data: ResearchFormData) => {
    if (!source) return
    
    try {
      setIsSubmitting(true)
      setSubmitError(null)
      
      await updateSource({
        id: source._id,
        title: data.title,
        url: data.url || undefined,
        concept: data.concept,
        categoryId: data.categoryId as Id<"categories">,
      })
      
      onClose()
    } catch (error) {
      console.error('Failed to update research source:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to update research source')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    form.reset()
    setSubmitError(null)
    onClose()
  }

  if (!source) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-brand-card border-brand-line max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-brand-line">
          <DialogTitle className="text-headline-primary text-lg font-medium">
            Edit Research Source
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
            <Label htmlFor="title" className="text-body-primary text-sm">
              Research Title
            </Label>
            <Input
              id="title"
              placeholder="e.g. AI Impact on Healthcare 2024"
              className="bg-brand-background border-brand-line text-headline-primary placeholder:text-zinc-500"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="url" className="text-body-primary text-sm">
              Reference URL <span className="text-body-secondary">(optional)</span>
            </Label>
            <Input
              id="url"
              placeholder="https://example.com/article"
              className="bg-brand-background border-brand-line text-headline-primary placeholder:text-zinc-500"
              {...form.register("url")}
            />
            {form.formState.errors.url && (
              <p className="text-sm text-red-500">{form.formState.errors.url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="concept" className="text-body-primary text-sm">
              Research Concept
            </Label>
            <Textarea
              id="concept"
              placeholder="Describe what you want to research or investigate..."
              className="bg-brand-background border-brand-line text-headline-primary placeholder:text-zinc-500 min-h-[100px] resize-none"
              {...form.register("concept")}
            />
            {form.formState.errors.concept && (
              <p className="text-sm text-red-500">{form.formState.errors.concept.message}</p>
            )}
          </div>

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

          <div className="flex justify-center pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}