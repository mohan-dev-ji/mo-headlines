"use client";

import { useState, useEffect } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { refreshIntervalToSeconds } from "@/lib/validations/rss";
import { toast } from "sonner";

interface FeedAnalysisProps {
  formData: {
    feedTitle: string;
    feedURL: string;
    numberOfArticles: number;
    category: string;
    status: "active" | "inactive";
    refreshInterval: string;
  };
  onAnalysisComplete: (analysis: any) => void;
  onBackToForm: () => void;
  analysis: any;
}

export function FeedAnalysis({ formData, onAnalysisComplete, onBackToForm, analysis }: FeedAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedArticleIndex, setSelectedArticleIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const testFeed = useAction(api.rssSources.testRSSFeed);
  const createSource = useMutation(api.rssSources.createRSSSource);

  // Auto-trigger analysis when component mounts and no analysis exists
  useEffect(() => {
    if (!analysis && !isAnalyzing) {
      handleTestFeed();
    }
  }, []);

  const handleTestFeed = async () => {
    setIsAnalyzing(true);
    try {
      const result = await testFeed({
        url: formData.feedURL,
        category: formData.category,
        numberOfArticles: formData.numberOfArticles,
      });
      onAnalysisComplete(result);
    } catch (error) {
      console.error("Feed analysis error:", error);
      onAnalysisComplete({
        feedTitle: formData.feedTitle,
        feedURL: formData.feedURL,
        category: formData.category,
        dateFetched: new Date().toISOString(),
        status: 'error',
        articles: [],
        error: error instanceof Error ? error.message : 'Failed to analyze RSS feed',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveSource = async () => {
    if (selectedArticleIndex === null || !analysis?.articles[selectedArticleIndex]) {
      return;
    }

    setIsSaving(true);
    try {
      const selectedArticle = analysis.articles[selectedArticleIndex];
      
      await createSource({
        name: formData.feedTitle,
        url: formData.feedURL,
        category: formData.category,
        isActive: formData.status === "active",
        pollFrequency: refreshIntervalToSeconds(formData.refreshInterval),
        numberOfArticles: formData.numberOfArticles,
        goldenArticleUrl: selectedArticle.url,
        goldenArticleTitle: selectedArticle.title,
        goldenArticleDate: new Date(selectedArticle.publishedAt).getTime(),
      });

      // Show success toast
      toast.success("RSS Source Created!", {
        description: `"${formData.feedTitle}" has been added to your active RSS sources.`,
      });

      // Trigger success step
      onAnalysisComplete({
        ...analysis,
        selectedArticle,
      });
    } catch (error) {
      console.error("Error saving RSS source:", error);
      toast.error("Failed to create RSS source", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary-button mx-auto mb-4" />
        <h3 className="text-headline-3 text-headline-primary mb-2">
          Analyzing RSS Feed
        </h3>
        <p className="text-body-md text-body-secondary">
          Testing feed connection and parsing articles...
        </p>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  if (analysis.status === 'error') {
    return (
      <div className="space-y-6">
        <Alert className="border-error bg-error/10">
          <AlertCircle className="h-4 w-4 text-error" />
          <AlertDescription className="text-error">
            <strong>Feed Analysis Failed:</strong> {analysis.error}
          </AlertDescription>
        </Alert>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBackToForm}>
            Edit Feed Details
          </Button>
          <Button onClick={handleTestFeed} className="bg-brand-primary-button hover:bg-brand-primary-button-hover">
            Retry Analysis
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success indicator */}
      <Alert className="border-indicator-approved bg-indicator-approved/10">
        <CheckCircle2 className="h-4 w-4 text-indicator-approved" />
        <AlertDescription className="text-indicator-approved">
          <strong>Feed Analysis Successful!</strong> Found {analysis.articles.length} articles ready for processing.
        </AlertDescription>
      </Alert>

      {/* Feed Metadata */}
      <div className="bg-brand-background border border-brand-line rounded-lg p-6">
        <h3 className="text-headline-3 text-headline-primary mb-4">Feed Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-body-sm">
          <div>
            <span className="text-body-secondary">Feed Title:</span>
            <p className="text-headline-primary font-medium">{analysis.feedTitle || formData.feedTitle}</p>
          </div>
          <div>
            <span className="text-body-secondary">Category:</span>
            <p className="text-headline-primary font-medium">{formData.category}</p>
          </div>
          <div>
            <span className="text-body-secondary">Feed URL:</span>
            <p className="text-headline-primary font-medium truncate">{formData.feedURL}</p>
          </div>
          <div>
            <span className="text-body-secondary">Date Fetched:</span>
            <p className="text-headline-primary font-medium">
              {new Date(analysis.dateFetched).toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-body-secondary">Status:</span>
            <p className="text-headline-primary font-medium capitalize">{formData.status}</p>
          </div>
          <div>
            <span className="text-body-secondary">Articles Found:</span>
            <p className="text-headline-primary font-medium">{analysis.articles.length}</p>
          </div>
          <div>
            <span className="text-body-secondary">Refresh Interval:</span>
            <p className="text-headline-primary font-medium">
              {formData.refreshInterval.replace('hr', ' Hours').replace('1week', '1 Week')}
            </p>
          </div>
        </div>
      </div>

      {/* Article Selection */}
      <div>
        <h3 className="text-headline-3 text-headline-primary mb-4">
          Select Golden Article for Synthesis
        </h3>
        <p className="text-body-md text-body-secondary mb-4">
          Choose one article to serve as the reference point for AI content synthesis and fact-checking.
        </p>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {analysis.articles.map((article: any, index: number) => (
            <div
              key={index}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedArticleIndex === index
                  ? "border-indicator-approved bg-indicator-approved/10"
                  : "border-brand-line bg-brand-background hover:bg-brand-card-dark"
              }`}
              onClick={() => setSelectedArticleIndex(index)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-body-md text-headline-primary font-medium mb-2 line-clamp-2">
                    {article.title}
                  </h4>
                  <p className="text-caption text-body-secondary mb-2 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center space-x-4 text-caption text-body-greyed-out">
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    {article.categories && article.categories.length > 0 && (
                      <span>Categories: {article.categories.slice(0, 2).join(", ")}</span>
                    )}
                  </div>
                </div>
                {selectedArticleIndex === index && (
                  <CheckCircle2 className="h-5 w-5 text-indicator-approved flex-shrink-0 ml-3" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBackToForm}>
          Edit
        </Button>
        <Button
          onClick={handleSaveSource}
          disabled={selectedArticleIndex === null || isSaving}
          className="bg-brand-primary-button hover:bg-brand-primary-button-hover"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save RSS Source"
          )}
        </Button>
      </div>
    </div>
  );
}