"use client";

import { CheckCircle } from "lucide-react";

interface SuccessStepProps {
  feedTitle: string;
  selectedArticle: {
    title: string;
    url: string;
    publishedAt: string;
  } | null;
}

export function SuccessStep({ feedTitle, selectedArticle }: SuccessStepProps) {
  return (
    <div className="text-center py-8">
      <div className="flex justify-center mb-6">
        <CheckCircle className="h-16 w-16 text-indicator-approved" />
      </div>
      
      <h3 className="text-headline-2 text-headline-primary mb-2">
        RSS Source Created!
      </h3>
      
      <p className="text-body-md text-body-secondary mb-6">
        "{feedTitle}" has been successfully added to your active RSS sources.
      </p>

      {selectedArticle && (
        <div className="bg-brand-background border border-brand-line rounded-lg p-4 mb-6">
          <p className="text-body-sm text-body-secondary mb-2">Golden Article Selected:</p>
          <p className="text-body-md text-headline-primary font-medium">
            {selectedArticle.title}
          </p>
        </div>
      )}

      <p className="text-caption text-body-greyed-out">
        You will be redirected to the Active RSS Sources tab...
      </p>
    </div>
  );
}