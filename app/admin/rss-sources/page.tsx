"use client";

import { useState } from "react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Rss } from "lucide-react";
import { CreateRSSSourceDialog } from "@/components/admin/CreateRSSSourceDialog";
import { RSSSourceList } from "@/components/admin/RSSSourceList";
import { RSSSourceForm } from "@/components/admin/RSSSourceForm";
import { TabsBar, type TabItem } from "@/components/admin/TabsBar";
import type { RSSSourceFormData } from "@/lib/validations/rss";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { refreshIntervalToSeconds } from "@/lib/validations/rss";
import { toast } from "sonner";

export default function RSSSourcesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("producers");
  
  // Form data for inline RSS form
  const [formData, setFormData] = useState<RSSSourceFormData>({
    feedTitle: "",
    feedURL: "",
    numberOfArticles: 10,
    category: "",
    status: "active",
    refreshInterval: "24hr",
  });

  // Feed analysis state
  const [currentStep, setCurrentStep] = useState<'form' | 'analysis'>('form');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedAnalysis, setFeedAnalysis] = useState<any>(null);
  const [selectedArticleIndex, setSelectedArticleIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Convex actions
  const testFeed = useAction(api.rssSources.testRSSFeed);
  const createSource = useMutation(api.rssSources.createRSSSource);

  // Get RSS sources data
  const activeSources = useQuery(api.rssSources.getSourcesByStatus, { isActive: true });
  const inactiveSources = useQuery(api.rssSources.getSourcesByStatus, { isActive: false });

  const activeCount = activeSources?.length ?? 0;
  const inactiveCount = inactiveSources?.length ?? 0;

  // Handle inline form submission - test feed and show analysis
  const handleFormSubmit = async (data: RSSSourceFormData) => {
    setFormData(data);
    setIsAnalyzing(true);
    setCurrentStep('analysis');
    
    try {
      const result = await testFeed({
        url: data.feedURL,
        category: data.category,
        numberOfArticles: data.numberOfArticles,
      });
      setFeedAnalysis(result);
    } catch (error) {
      console.error("Feed analysis error:", error);
      setFeedAnalysis({
        feedTitle: data.feedTitle,
        feedURL: data.feedURL,
        category: data.category,
        dateFetched: new Date().toISOString(),
        status: 'error',
        articles: [],
        error: error instanceof Error ? error.message : 'Failed to analyze RSS feed',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle going back to form
  const handleBackToForm = () => {
    setCurrentStep('form');
    setFeedAnalysis(null);
    setSelectedArticleIndex(null);
  };

  // Handle saving RSS source
  const handleSaveSource = async () => {
    if (selectedArticleIndex === null || !feedAnalysis?.articles[selectedArticleIndex]) {
      return;
    }

    setIsSaving(true);
    try {
      const selectedArticle = feedAnalysis.articles[selectedArticleIndex];
      
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
      toast.success("Producer Created!", {
        description: `"${formData.feedTitle}" has been added to your active producers.`,
      });

      // Reset state and switch to active tab
      setCurrentStep('form');
      setFeedAnalysis(null);
      setSelectedArticleIndex(null);
      setFormData({
        feedTitle: "",
        feedURL: "",
        numberOfArticles: 10,
        category: "",
        status: "active",
        refreshInterval: "24hr",
      });
      setActiveTab("producers");
    } catch (error) {
      console.error("Error saving RSS source:", error);
      toast.error("Failed to create producer", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const tabs: TabItem[] = [
    {
      value: "producers",
      label: "Producers",
      count: activeCount,
    },
    {
      value: "queue",
      label: "Queue",
    },
    {
      value: "consumer",
      label: "Consumer",
    },
  ];

  return (
    <div className="flex flex-col h-full">
     
      {/* Main content */}
      <div className="flex-1 mt-[var(--padding-md)]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsBar tabs={tabs} />

          {/* Producers Tab */}
          <TabsContent value="producers" className="h-full w-full">
            <div className="w-full h-full bg-brand-card rounded-[var(--radius)]">
              {currentStep === 'form' ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-full max-w-[600px] bg-brand-card-dark rounded-[var(--radius)] p-[var(--padding-md)]">
                    <div className="mb-6">
                      <h2 className="text-base font-medium text-headline-primary py-[var(--padding-md)] border-b border-brand-line">
                        Create New Producer
                      </h2>
                    </div>

                    <RSSSourceForm
                      initialData={formData}
                      onSubmit={handleFormSubmit}
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full p-[var(--padding-md)] overflow-y-auto">
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-brand-primary-button mx-auto mb-4" />
                        <h3 className="text-headline-3 text-headline-primary mb-2">
                          Analyzing RSS Feed
                        </h3>
                        <p className="text-body-md text-body-secondary">
                          Testing feed connection and parsing articles...
                        </p>
                      </div>
                    </div>
                  ) : feedAnalysis ? (
                    <div className="max-w-4xl mx-auto space-y-6">
                      {/* Header with back button */}
                      <div className="flex items-center justify-between border-b border-brand-line pb-4">
                        <div>
                          <h2 className="text-headline-2 text-headline-primary mb-2">
                            Feed Analysis Results
                          </h2>
                          <p className="text-body-md text-body-secondary">
                            Review the feed details and select a golden article
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleBackToForm}
                          className="flex items-center gap-2"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to Form
                        </Button>
                      </div>

                      {feedAnalysis.status === 'error' ? (
                        <div className="space-y-6">
                          <Alert className="border-error bg-error/10">
                            <AlertCircle className="h-4 w-4 text-error" />
                            <AlertDescription className="text-error">
                              <strong>Feed Analysis Failed:</strong> {feedAnalysis.error}
                            </AlertDescription>
                          </Alert>

                          <div className="flex justify-between">
                            <Button variant="outline" onClick={handleBackToForm}>
                              Edit Feed Details
                            </Button>
                            <Button onClick={() => handleFormSubmit(formData)} className="bg-brand-primary-button hover:bg-brand-primary-button-hover">
                              Retry Analysis
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Success indicator */}
                          <Alert className="border-indicator-approved bg-indicator-approved/10">
                            <CheckCircle2 className="h-4 w-4 text-indicator-approved" />
                            <AlertDescription className="text-indicator-approved">
                              <strong>Feed Analysis Successful!</strong> Found {feedAnalysis.articles.length} articles ready for processing.
                            </AlertDescription>
                          </Alert>

                          {/* Feed Metadata */}
                          <div className="bg-brand-background border border-brand-line rounded-lg p-6">
                            <h3 className="text-headline-3 text-headline-primary mb-4">Feed Information</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-body-sm">
                              <div>
                                <span className="text-body-secondary">Feed Title:</span>
                                <p className="text-headline-primary font-medium">{feedAnalysis.feedTitle || formData.feedTitle}</p>
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
                                  {new Date(feedAnalysis.dateFetched).toLocaleString()}
                                </p>
                              </div>
                             
                              <div>
                                <span className="text-body-secondary">Status:</span>
                                <p className="text-headline-primary font-medium capitalize">{formData.status}</p>
                              </div>
                              <div>
                                <span className="text-body-secondary">Articles Found:</span>
                                <p className="text-headline-primary font-medium">{feedAnalysis.articles.length}</p>
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
                              {feedAnalysis.articles.map((article: any, index: number) => (
                                <div
                                  key={index}
                                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                    selectedArticleIndex === index
                                      ? "border-indicator-approved bg-indicator-approved/10"
                                      : "border-brand-line bg-brand-background hover:bg-brand-card-dark"
                                  }`}
                                  onClick={() => {
                                    console.log('🔍 Article clicked:', {
                                      index: index,
                                      article: article,
                                      metadata: {
                                        title: article.title,
                                        url: article.url,
                                        publishedAt: article.publishedAt,
                                        excerpt: article.excerpt,
                                        categories: article.categories,
                                      },
                                      rawData: article // Full object for deep inspection
                                    });
                                    setSelectedArticleIndex(index);
                                  }}
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
                          <div className="flex justify-between pt-4 border-t border-brand-line">
                            <Button variant="outline" onClick={handleBackToForm}>
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
                                "Save Producer"
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Queue Tab */}
          <TabsContent value="queue" className="h-full">
            <div className="w-full h-full bg-brand-card rounded-[var(--radius)] p-[var(--padding-md)]">
              <div className="text-center">
                <h3 className="text-headline-3 text-headline-primary mb-2">
                  Queue Monitoring
                </h3>
                <p className="text-body-md text-body-secondary">
                  Monitor pending articles awaiting AI processing
                </p>
                <p className="text-caption text-body-greyed-out mt-4">
                  Queue interface coming soon...
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Consumer Tab */}
          <TabsContent value="consumer" className="h-full">
            <div className="w-full h-full bg-brand-card rounded-[var(--radius)] p-[var(--padding-md)]">
              <div className="text-center">
                <h3 className="text-headline-3 text-headline-primary mb-2">
                  Batch Processing Controls
                </h3>
                <p className="text-body-md text-body-secondary">
                  Configure and monitor AI batch processing
                </p>
                <p className="text-caption text-body-greyed-out mt-4">
                  Batch processing interface coming soon...
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Producer Dialog */}
      <CreateRSSSourceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        initialFormData={formData}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
          setActiveTab("producers");
          // Reset producer form data
          setFormData({
            feedTitle: "",
            feedURL: "",
            numberOfArticles: 10,
            category: "",
            status: "active",
            refreshInterval: "24hr",
          });
        }}
      />
    </div>
  );
}