"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { StepIndicator } from "./StepIndicator";
import { RSSSourceForm } from "./RSSSourceForm";
import { FeedAnalysis } from "./FeedAnalysis";
import { SuccessStep } from "./SuccessStep";
import type { RSSSourceFormData } from "@/lib/validations/rss";

interface CreateRSSSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialFormData?: RSSSourceFormData;
}

export interface RSSFormData {
  feedTitle: string;
  feedURL: string;
  numberOfArticles: number;
  category: string;
  status: "active" | "inactive";
  refreshInterval: string;
}

export interface FeedAnalysisData {
  feedTitle: string;
  feedURL: string;
  category: string;
  dateFetched: string;
  status: 'success' | 'error';
  articles: Array<{
    title: string;
    url: string;
    publishedAt: string;
    excerpt: string;
    categories?: string[];
  }>;
  error?: string;
}

const steps = ["RSS Details", "Test Feed", "Select Article", "Success"];

export function CreateRSSSourceDialog({ open, onOpenChange, onSuccess, initialFormData }: CreateRSSSourceDialogProps) {
  const [currentStep, setCurrentStep] = useState(initialFormData ? 2 : 1);
  const [formData, setFormData] = useState<RSSSourceFormData>(
    initialFormData || {
      feedTitle: "",
      feedURL: "",
      numberOfArticles: 10,
      category: "",
      status: "active",
      refreshInterval: "24hr",
    }
  );
  const [feedAnalysis, setFeedAnalysis] = useState<FeedAnalysisData | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<{
    title: string;
    url: string;
    publishedAt: string;
  } | null>(null);

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      feedTitle: "",
      feedURL: "",
      numberOfArticles: 10,
      category: "",
      status: "active",
      refreshInterval: "24hr",
    });
    setFeedAnalysis(null);
    setSelectedArticle(null);
    onOpenChange(false);
  };

  const handleFormSubmit = (data: RSSSourceFormData) => {
    setFormData(data);
    setCurrentStep(2);
  };

  const handleFeedAnalysisComplete = (analysis: FeedAnalysisData) => {
    setFeedAnalysis(analysis);
    if (analysis.status === 'success') {
      setCurrentStep(3);
    }
  };

  const handleArticleSelected = (article: { title: string; url: string; publishedAt: string }) => {
    setSelectedArticle(article);
    setCurrentStep(4);
    // Trigger success callback after a short delay
    setTimeout(() => {
      onSuccess();
      handleClose();
    }, 2000);
  };

  const handleBackToForm = () => {
    setCurrentStep(1);
    setFeedAnalysis(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-brand-card border-brand-line">
        <DialogHeader className="relative">
          <DialogTitle className="text-headline-3 text-headline-primary text-center">
            Create RSS Source
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 text-body-secondary hover:text-headline-primary"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="py-6">
          {/* Step Indicator */}
          <StepIndicator 
            currentStep={currentStep} 
            totalSteps={steps.length} 
            steps={steps} 
          />

          {/* Step Content */}
          <div className="mt-8">
            {currentStep === 1 && (
              <RSSSourceForm
                initialData={formData}
                onSubmit={handleFormSubmit}
              />
            )}

            {currentStep === 2 && (
              <FeedAnalysis
                formData={formData}
                onAnalysisComplete={handleFeedAnalysisComplete}
                onBackToForm={handleBackToForm}
                analysis={feedAnalysis}
              />
            )}

            {currentStep === 3 && feedAnalysis && (
              <div>
                {/* Feed metadata display and article selection will go here */}
                <div className="text-center py-8">
                  <h3 className="text-headline-3 text-headline-primary mb-4">
                    Select Golden Article
                  </h3>
                  <p className="text-body-md text-body-secondary mb-6">
                    Choose one article to serve as the reference for AI synthesis
                  </p>
                  
                  {/* Article list */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {feedAnalysis.articles.map((article, index) => (
                      <div
                        key={index}
                        className="p-4 border border-brand-line rounded-lg bg-brand-background hover:bg-brand-card-dark cursor-pointer transition-colors"
                        onClick={() => handleArticleSelected({
                          title: article.title,
                          url: article.url,
                          publishedAt: article.publishedAt,
                        })}
                      >
                        <h4 className="text-body-md text-headline-primary font-medium mb-2">
                          {article.title}
                        </h4>
                        <p className="text-caption text-body-secondary">
                          {article.excerpt.substring(0, 150)}...
                        </p>
                        <p className="text-caption text-body-greyed-out mt-2">
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button
                      variant="outline"
                      onClick={handleBackToForm}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <SuccessStep
                feedTitle={formData.feedTitle}
                selectedArticle={selectedArticle}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}