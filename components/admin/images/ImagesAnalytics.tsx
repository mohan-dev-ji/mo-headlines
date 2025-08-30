"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  TrendingUp, 
  Star, 
  Zap,
  DollarSign,
  Palette,
  CheckCircle,
  Clock,
  XCircle,
  Archive
} from "lucide-react";

interface AnalyticsData {
  totalImages: number;
  byStatus: {
    pending: number;
    approved: number;
    rejected: number;
    unused: number;
  };
  byRating: {
    averageRating: number;
    ratedImages: number;
    highRated: number;
  };
  byPromptSource: {
    "ai-generated": number;
    "custom": number;
    "edited": number;
  };
  byModel: Record<string, number>;
  totalCost: number;
}

interface ImagesAnalyticsProps {
  data: AnalyticsData;
}

export function ImagesAnalytics({ data }: ImagesAnalyticsProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "unused":
        return <Archive className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getPromptSourceIcon = (source: string) => {
    switch (source) {
      case "ai-generated":
        return <Zap className="h-4 w-4 text-blue-600" />;
      case "custom":
        return <Palette className="h-4 w-4 text-purple-600" />;
      case "edited":
        return <BarChart3 className="h-4 w-4 text-orange-600" />;
      default:
        return null;
    }
  };

  const approvalRate = data.totalImages > 0 
    ? ((data.byStatus.approved / data.totalImages) * 100).toFixed(1)
    : "0";

  const highRatingRate = data.byRating.ratedImages > 0
    ? ((data.byRating.highRated / data.byRating.ratedImages) * 100).toFixed(1)
    : "0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Overview Stats */}
      <Card className="bg-brand-card border-brand-line">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-body-secondary flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-2xl font-bold text-body-primary">
            {data.totalImages}
          </div>
          <div className="text-xs text-body-secondary">
            Total Images
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-body-secondary">Approval Rate</span>
              <Badge variant="secondary" className="text-xs">
                {approvalRate}%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-body-secondary">High Quality</span>
              <Badge variant="secondary" className="text-xs">
                {highRatingRate}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <Card className="bg-brand-card border-brand-line">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-body-secondary flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(data.byStatus).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(status)}
                <span className="text-xs text-body-primary capitalize">
                  {status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-body-primary">
                  {count}
                </span>
                <Badge variant="outline" className="text-xs">
                  {data.totalImages > 0 
                    ? ((count / data.totalImages) * 100).toFixed(0)
                    : 0
                  }%
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quality Metrics */}
      <Card className="bg-brand-card border-brand-line">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-body-secondary flex items-center gap-2">
            <Star className="h-4 w-4" />
            Quality Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-xl font-bold text-body-primary flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {data.byRating.averageRating.toFixed(1)}
            </div>
            <div className="text-xs text-body-secondary">
              Average Rating
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-body-secondary">Rated Images</span>
              <span className="text-sm font-medium text-body-primary">
                {data.byRating.ratedImages}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-body-secondary">High Rated (7+)</span>
              <span className="text-sm font-medium text-body-primary">
                {data.byRating.highRated}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prompt Sources */}
      <Card className="bg-brand-card border-brand-line">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-body-secondary flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Prompt Sources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(data.byPromptSource).map(([source, count]) => (
            <div key={source} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getPromptSourceIcon(source)}
                <span className="text-xs text-body-primary capitalize">
                  {source.replace("-", " ")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-body-primary">
                  {count}
                </span>
                <Badge variant="outline" className="text-xs">
                  {data.totalImages > 0 
                    ? ((count / data.totalImages) * 100).toFixed(0)
                    : 0
                  }%
                </Badge>
              </div>
            </div>
          ))}

          <Separator />

          {/* Cost Information */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-xs text-body-primary">Total Cost</span>
            </div>
            <span className="text-sm font-medium text-body-primary">
              ${data.totalCost.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Model Usage (spans multiple columns if there are many models) */}
      {Object.keys(data.byModel).length > 0 && (
        <Card className="bg-brand-card border-brand-line md:col-span-2 lg:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-body-secondary flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Model Usage
            </CardTitle>
            <CardDescription className="text-xs text-body-tertiary">
              Distribution of images by generation model
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(data.byModel)
                .sort(([,a], [,b]) => b - a)
                .map(([model, count]) => (
                <div key={model} className="text-center">
                  <div className="text-lg font-bold text-body-primary">
                    {count}
                  </div>
                  <div className="text-xs text-body-secondary truncate">
                    {model}
                  </div>
                  <Badge variant="outline" className="text-xs mt-1">
                    {data.totalImages > 0 
                      ? ((count / data.totalImages) * 100).toFixed(0)
                      : 0
                    }%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}