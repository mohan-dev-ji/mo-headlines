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
import { Rss, FileText, BarChart3, Users, TrendingUp, Clock, Youtube, Search, CheckCircle, XCircle, Edit3 } from "lucide-react";

export default function AdminPage() {
  const { isLoaded, user } = useUser();
  const router = useRouter();

  // Get data for dashboard stats
  const allSources = useQuery(api.createRss.getRssSources, { includeCategory: true });
  const activeSources = allSources?.filter(source => source.isActive) || [];
  const inactiveSources = allSources?.filter(source => !source.isActive) || [];
  const articles = useQuery(api.articles.getAllArticles);
  const categories = useQuery(api.categories.getAllCategories);

  // Get article stats by status
  const pendingArticles = articles?.filter(article => article.status === 'pending') || [];
  const approvedArticles = articles?.filter(article => article.status === 'approved') || [];
  const rejectedArticles = articles?.filter(article => article.status === 'rejected') || [];
  const draftArticles = articles?.filter(article => article.status === 'draft') || [];

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

  const activeSourcesCount = activeSources.length;
  const inactiveSourcesCount = inactiveSources.length;
  const totalProducers = activeSourcesCount + inactiveSourcesCount;
  const articlesCount = articles?.length ?? 0;
  const categoriesCount = categories?.length ?? 0;

  // Calculate article breakdown
  const totalComments = 35; // TODO: Get from API when comments are implemented
  const likedArticles = 11; // TODO: Get from API when likes are implemented

  // Source breakdown counts (placeholder for now)
  const rssActiveCount = activeSources.length;
  const youtubeActiveCount = 3; // TODO: Get from YouTube sources API
  const researchActiveCount = 3; // TODO: Get from Research sources API

  return (
    <div className="h-auto bg-brand-card-dark rounded-lg p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-headline-1 text-headline-primary mb-2">Admin Dashboard</h1>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              50 from RSS<br />4 from Youtube
            </p>
          </CardContent>
        </Card>

        <Card className="bg-brand-card border-brand-line">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body-sm text-body-secondary font-medium">
              Total Comments
            </CardTitle>
            <Users className="h-4 w-4 text-brand-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-headline-2 text-headline-primary font-bold">
              {totalComments}
            </div>
            <p className="text-caption text-body-greyed-out">
              User engagement
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
              Liked Articles
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-indicator-approved" />
          </CardHeader>
          <CardContent>
            <div className="text-headline-2 text-headline-primary font-bold">
              {likedArticles}
            </div>
            <p className="text-caption text-body-greyed-out">
              50 from RSS<br />4 from Youtube
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sources Management Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-brand-card border-brand-line">
          <CardHeader>
            <CardTitle className="text-headline-3 text-headline-primary flex items-center justify-between">
              RSS Sources
              <Rss className="h-5 w-5 text-brand-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/admin/create?tab=rss">
              <Button className="w-full bg-brand-primary-button hover:bg-brand-primary-button-hover mb-4">
                Manage RSS Sources
              </Button>
            </Link>
            <div className="text-body-sm text-body-secondary">
              0 active<br />
              {rssActiveCount} active
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-card border-brand-line">
          <CardHeader>
            <CardTitle className="text-headline-3 text-headline-primary flex items-center justify-between">
              YouTube Sources
              <Youtube className="h-5 w-5 text-brand-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/admin/create?tab=youtube">
              <Button className="w-full bg-brand-primary-button hover:bg-brand-primary-button-hover mb-4">
                Manage YouTube Sources
              </Button>
            </Link>
            <div className="text-body-sm text-body-secondary">
              0 active<br />
              {youtubeActiveCount} active
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-card border-brand-line">
          <CardHeader>
            <CardTitle className="text-headline-3 text-headline-primary flex items-center justify-between">
              Research Sources
              <Search className="h-5 w-5 text-brand-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/admin/create?tab=research">
              <Button className="w-full bg-brand-primary-button hover:bg-brand-primary-button-hover mb-4">
                Manage Research Sources
              </Button>
            </Link>
            <div className="text-body-sm text-body-secondary">
              0 active<br />
              {researchActiveCount} active
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Article Management Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-brand-card border-brand-line">
          <CardHeader>
            <CardTitle className="text-headline-3 text-body-secondary flex items-center justify-between">
              Pending
              <Clock className="h-5 w-5 text-indicator-pending" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/admin/review?tab=pending">
              <Button variant="outline" className="w-full mb-4">
                Manage Pending Articles
              </Button>
            </Link>
            <div className="text-body-sm text-body-secondary">
              {pendingArticles.length} awaiting approval
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-card border-brand-line">
          <CardHeader>
            <CardTitle className="text-headline-3 text-indicator-approved flex items-center justify-between">
              Approved
              <CheckCircle className="h-5 w-5 text-indicator-approved" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/admin/review?tab=approved">
              <Button variant="outline" className="w-full mb-4">
                Manage Approved Articles
              </Button>
            </Link>
            <div className="text-body-sm text-body-secondary">
              {approvedArticles.length} approved and active
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-card border-brand-line">
          <CardHeader>
            <CardTitle className="text-headline-3 text-indicator-rejected flex items-center justify-between">
              Rejected
              <XCircle className="h-5 w-5 text-indicator-rejected" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/admin/review?tab=rejected">
              <Button variant="outline" className="w-full mb-4">
                Manage Rejected Articles
              </Button>
            </Link>
            <div className="text-body-sm text-body-secondary">
              {rejectedArticles.length} awaiting deletion
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-card border-brand-line">
          <CardHeader>
            <CardTitle className="text-headline-3 text-indicator-drafts flex items-center justify-between">
              Drafts
              <Edit3 className="h-5 w-5 text-indicator-drafts" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/admin/review?tab=drafts">
              <Button variant="outline" className="w-full mb-4">
                Articles Saved in Drafts
              </Button>
            </Link>
            <div className="text-body-sm text-body-secondary">
              {draftArticles.length} awaiting completion
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 