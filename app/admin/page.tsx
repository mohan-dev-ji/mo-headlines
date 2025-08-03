"use client";

import { useUser } from "@clerk/nextjs";
import { isAdmin } from "@/lib/admin";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { Rss, FileText, BarChart3, Users, TrendingUp, Clock } from "lucide-react";

export default function AdminPage() {
  const { isLoaded, user } = useUser();
  const router = useRouter();

  // Get data for dashboard stats
  const activeSources = useQuery(api.rssProducer.getProducersByStatus, { isActive: true });
  const inactiveSources = useQuery(api.rssProducer.getProducersByStatus, { isActive: false });
  const articles = useQuery(api.articles.getAllArticles);
  const categories = useQuery(api.categories.getAllCategories);

  useEffect(() => {
    if (isLoaded && !isAdmin(user?.id)) {
      router.push("/");
    }
  }, [isLoaded, user?.id, router]);

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingAnimation size={60} />
      </div>
    );
  }

  if (!isAdmin(user?.id)) {
    return null;
  }

  const activeSourcesCount = activeSources?.length ?? 0;
  const inactiveSourcesCount = inactiveSources?.length ?? 0;
  const totalProducers = activeSourcesCount + inactiveSourcesCount;
  const articlesCount = articles?.length ?? 0;
  const categoriesCount = categories?.length ?? 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-headline-1 text-headline-primary mb-2">Admin Dashboard</h1>
        <p className="text-body-md text-body-secondary">
          Welcome back! Here's an overview of your Mo Headlines platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-brand-card border-brand-line">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body-sm text-body-secondary font-medium">
              Active RSS Producers
            </CardTitle>
            <Rss className="h-4 w-4 text-indicator-approved" />
          </CardHeader>
          <CardContent>
            <div className="text-headline-2 text-headline-primary font-bold">
              {activeSourcesCount}
            </div>
            <p className="text-caption text-body-greyed-out">
              {totalProducers} total producers
            </p>
          </CardContent>
        </Card>

        <Card className="bg-brand-card border-brand-line">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body-sm text-body-secondary font-medium">
              Total Articles
            </CardTitle>
            <FileText className="h-4 w-4 text-brand-primary-button" />
          </CardHeader>
          <CardContent>
            <div className="text-headline-2 text-headline-primary font-bold">
              {articlesCount}
            </div>
            <p className="text-caption text-body-greyed-out">
              Published content
            </p>
          </CardContent>
        </Card>

        <Card className="bg-brand-card border-brand-line">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body-sm text-body-secondary font-medium">
              Categories
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-headline-2 text-headline-primary font-bold">
              {categoriesCount}
            </div>
            <p className="text-caption text-body-greyed-out">
              Content categories
            </p>
          </CardContent>
        </Card>

        <Card className="bg-brand-card border-brand-line">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body-sm text-body-secondary font-medium">
              System Status
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-indicator-approved" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge className="bg-indicator-approved text-button-white">
                Operational
              </Badge>
            </div>
            <p className="text-caption text-body-greyed-out">
              All systems running
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-brand-card border-brand-line">
          <CardHeader>
            <CardTitle className="text-headline-3 text-headline-primary flex items-center">
              <Rss className="mr-2 h-5 w-5 text-brand-primary" />
              RSS Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-body-sm text-body-secondary mb-4">
              Manage your RSS producers and monitor feeds for content generation.
            </p>
            <div className="flex flex-col space-y-2">
              <Link href="/admin/rss-sources">
                <Button className="w-full bg-brand-primary-button hover:bg-brand-primary-button-hover">
                  Manage RSS Sources
                </Button>
              </Link>
              <div className="text-caption text-body-greyed-out text-center">
                {activeSourcesCount} active • {inactiveSourcesCount} inactive
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-card border-brand-line">
          <CardHeader>
            <CardTitle className="text-headline-3 text-headline-primary flex items-center">
              <FileText className="mr-2 h-5 w-5 text-brand-primary" />
              Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-body-sm text-body-secondary mb-4">
              Review, edit, and publish AI-generated articles from your RSS sources.
            </p>
            <Link href="/admin/articles">
              <Button variant="outline" className="w-full">
                Manage Articles
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-brand-card border-brand-line">
          <CardHeader>
            <CardTitle className="text-headline-3 text-headline-primary flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-brand-primary" />
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-body-sm text-body-secondary mb-4">
              View performance metrics and insights for your content platform.
            </p>
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full">
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 