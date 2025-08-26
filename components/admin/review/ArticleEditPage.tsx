"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { use, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ReactMarkdown from "react-markdown"
import { X } from "lucide-react"
import { toast } from "sonner"
import { useDropzone } from "react-dropzone"
import Image from "next/image"

interface ArticleEditPageProps {
  params: Promise<{ id: string }>
}

export function ArticleEditPage({ params }: ArticleEditPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  
  const article = useQuery(api.articles.getArticle, { id: resolvedParams.id as Id<"articles"> })
  const categories = useQuery(api.categories.getAllCategories)
  const updateArticle = useMutation(api.articles.updateArticle)
  const generateUploadUrl = useMutation(api.articles.generateUploadUrl)

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    excerpt: "",
    categoryId: "" as Id<"categories"> | "",
    createSource: "",
    sourceUrls: [] as string[]
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newSourceUrl, setNewSourceUrl] = useState("")
  
  // Image handling states
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [showCurrentImage, setShowCurrentImage] = useState(true)

  // Initialize form data when article loads
  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        body: article.body,
        excerpt: article.excerpt || "",
        categoryId: article.categoryId,
        createSource: article.createSource,
        sourceUrls: article.sourceUrls || []
      })
      // Reset image states when article changes (e.g., when returning from image generation)
      setPreviewUrl(null)
      setSelectedImageFile(null)
      setShowCurrentImage(!!article.imageStorageId)
    }
  }, [article])

  // Image dropzone handlers
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedImageFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setPreviewUrl(reader.result as string)
        setShowCurrentImage(false)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
  })

  const handleRemoveImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setPreviewUrl(null)
    setSelectedImageFile(null)
    setShowCurrentImage(false)
  }, [])


  // Form handlers
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, categoryId: value as Id<"categories"> }))
  }

  // Navigation handlers
  const handleCancel = () => {
    router.push(`/admin/review/preview/${resolvedParams.id}`)
  }

  // Save handler
  const handleSave = async () => {
    if (!article || !formData.categoryId || isSubmitting) return

    setIsSubmitting(true)
    try {
      // Handle image upload if needed
      let imageStorageId = article.imageStorageId
      
      if (selectedImageFile) {
        const uploadUrl = await generateUploadUrl()
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImageFile.type },
          body: selectedImageFile,
        })
        
        if (!response.ok) {
          throw new Error("Failed to upload image")
        }
        
        const { storageId } = await response.json()
        imageStorageId = storageId
      } else if (!showCurrentImage) {
        imageStorageId = undefined
      }

      // Update article
      await updateArticle({
        id: article._id,
        title: formData.title,
        body: formData.body,
        categoryId: formData.categoryId,
        imageStorageId,
        excerpt: formData.excerpt,
        createSource: formData.createSource,
        sourceUrls: formData.sourceUrls,
      })

      toast.success("Article updated successfully")
      router.push(`/admin/review/preview/${resolvedParams.id}`)
    } catch (error) {
      toast.error(`Failed to update article: ${error}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <LoadingAnimation size={60} className="py-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-[var(--padding-md)] px-[var(--padding-md)]">
      {/* Main Content - Centered Edit Area */}
      <div className="py-8 bg-brand-card rounded-md">
        <div className="max-w-2xl mx-auto">
          <div className="bg-brand-card-dark border border-brand-line rounded-lg">
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-brand-line flex items-center justify-between">
              <h1 className="text-lg font-semibold text-headline-primary">Edit Article</h1>
              <Button 
                onClick={handleCancel}
                variant="ghost"
                size="sm"
                className="text-headline-primary hover:bg-brand-card"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Card Content */}
            <div className="px-6 py-6">
              <form className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-2">
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActive ? "border-primary bg-primary/10" : "border-brand-line"
                    }`}
                  >
                    <input {...getInputProps()} />
                    {previewUrl ? (
                      <div 
                        className="relative w-full aspect-video cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/admin/review/${resolvedParams.id}/generate-image`)
                        }}
                      >
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          fill
                          className="object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 bg-white/80 rounded-full p-2 hover:bg-white z-10"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : showCurrentImage && article.imageUrl ? (
                      <div 
                        className="relative w-full aspect-video cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/admin/review/${resolvedParams.id}/generate-image`)
                        }}
                      >
                        <Image
                          src={article.imageUrl}
                          alt="Current image"
                          fill
                          className="object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 bg-white/80 rounded-full p-2 hover:bg-white z-10"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="py-8">
                        <div className="w-12 h-12 mx-auto mb-4 border-2 border-dashed border-brand-line rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-body-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-body-secondary text-sm mb-3">
                          {isDragActive ? "Drop image here" : "Drag and drop an image, or click to select"}
                        </p>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          className="text-headline-secondary border-brand-line hover:bg-zinc-200"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/admin/review/${resolvedParams.id}/generate-image`)
                          }}
                        >
                          Generate Image
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-headline-primary font-medium">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Input Value"
                    required
                    className="bg-brand-card border-brand-line text-body-primary"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label className="text-headline-primary font-medium">Category</Label>
                  <Select value={formData.categoryId || ""} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="bg-brand-card border-brand-line text-body-primary">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Body */}
                <div className="space-y-2">
                  <Label className="text-headline-primary font-medium">Body</Label>
                  <Textarea
                    value={formData.body}
                    onChange={(e) => handleInputChange("body", e.target.value)}
                    placeholder="Input Value"
                    className="min-h-[200px] font-mono text-sm bg-brand-card border-brand-line text-body-primary resize-none"
                    rows={12}
                  />
                </div>

                {/* Sources */}
                <div className="space-y-2">
                  <Label className="text-headline-primary font-medium">Sources</Label>
                  <Textarea
                    value={formData.sourceUrls.join('\n')}
                    onChange={(e) => setFormData(prev => ({ ...prev, sourceUrls: e.target.value.split('\n').filter(url => url.trim()) }))}
                    placeholder="Input Value"
                    className="min-h-[120px] bg-brand-card border-brand-line text-body-primary resize-none"
                    rows={6}
                  />
                </div>
              </form>
            </div>
            
            {/* Card Footer */}
            <div className="px-6 py-4 border-t border-brand-line flex justify-end gap-3">
              <Button 
                onClick={handleSave}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
              
              <Button 
                onClick={handleCancel}
                variant="outline"
                className="text-headline-secondary border-brand-line hover:bg-zinc-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}