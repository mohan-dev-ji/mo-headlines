"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { rssSourceSchema, refreshIntervalOptions, type RSSSourceFormData } from "@/lib/validations/rss";
import { Loader2 } from "lucide-react";

interface RSSSourceFormProps {
  initialData: RSSSourceFormData;
  onSubmit: (data: RSSSourceFormData) => void;
}

export function RSSSourceForm({ initialData, onSubmit }: RSSSourceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get categories for dropdown
  const categories = useQuery(api.categories.getActiveCategories);

  const form = useForm<RSSSourceFormData>({
    resolver: zodResolver(rssSourceSchema),
    defaultValues: initialData,
  });

  const handleSubmit = async (data: RSSSourceFormData) => {
    setIsSubmitting(true);
    try {
      onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Feed Title */}
        <div className="space-y-2">
          <Label htmlFor="feedTitle" className="text-body-sm text-body-primary">
            Feed Title *
          </Label>
          <Input
            id="feedTitle"
            {...form.register("feedTitle")}
            placeholder="e.g., TechCrunch"
            className="bg-brand-background border-brand-line text-headline-primary"
          />
          {form.formState.errors.feedTitle && (
            <p className="text-caption text-error">
              {form.formState.errors.feedTitle.message}
            </p>
          )}
        </div>

        {/* Feed URL */}
        <div className="space-y-2">
          <Label htmlFor="feedURL" className="text-body-sm text-body-primary">
            Feed URL *
          </Label>
          <Input
            id="feedURL"
            {...form.register("feedURL")}
            placeholder="https://example.com/rss"
            className="bg-brand-background border-brand-line text-headline-primary "
          />
          {form.formState.errors.feedURL && (
            <p className="text-caption text-error">
              {form.formState.errors.feedURL.message}
            </p>
          )}
        </div>

        {/* Number of Articles */}
        <div className="space-y-2">
          <Label htmlFor="numberOfArticles" className="text-body-sm text-body-primary">
            Number of Articles *
          </Label>
          <Input
            id="numberOfArticles"
            type="number"
            min="1"
            max="100"
            {...form.register("numberOfArticles", { valueAsNumber: true })}
            className="bg-brand-background border-brand-line text-headline-primary"
          />
          {form.formState.errors.numberOfArticles && (
            <p className="text-caption text-error">
              {form.formState.errors.numberOfArticles.message}
            </p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label className="text-body-sm text-body-primary">
            Category
          </Label>
          <Select
            value={form.watch("category") || "all"}
            onValueChange={(value) => form.setValue("category", value === "all" ? "" : value)}
          >
            <SelectTrigger className="bg-brand-background border-brand-line text-headline-primary w-full">
              <SelectValue placeholder="All Categories (default)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category._id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.category && (
            <p className="text-caption text-error">
              {form.formState.errors.category.message}
            </p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2 w-full">
          <Label className="text-body-sm text-body-primary w-full">
            Status *
          </Label>
          <Select
            value={form.watch("status")}
            onValueChange={(value: "active" | "inactive") => form.setValue("status", value)}
          >
            <SelectTrigger className="bg-brand-background border-brand-line text-headline-primary w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.status && (
            <p className="text-caption text-error">
              {form.formState.errors.status.message}
            </p>
          )}
        </div>

        {/* Refresh Interval */}
        <div className="space-y-2">
          <Label className="text-body-sm text-body-primary">
            Refresh Interval *
          </Label>
          <Select
            value={form.watch("refreshInterval")}
            onValueChange={(value) => form.setValue("refreshInterval", value)}
          >
            <SelectTrigger className="bg-brand-background border-brand-line text-headline-primary w-full">
              <SelectValue placeholder="Select refresh interval" />
            </SelectTrigger>
            <SelectContent>
              {refreshIntervalOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.refreshInterval && (
            <p className="text-caption text-error">
              {form.formState.errors.refreshInterval.message}
            </p>
          )}
        </div>
      </div>

      

      {/* Submit Button */}
      <div className="flex justify-start pt-4 border-t border-brand-line">
        <Button
          type="submit"
          disabled={isSubmitting || !categories}
          className="bg-brand-primary-button hover:bg-brand-primary-button-hover text-button-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Feed...
            </>
          ) : (
            "Test Feed"
          )}
        </Button>
      </div>
    </form>
  );
}