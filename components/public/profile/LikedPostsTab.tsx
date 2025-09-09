"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LandscapeCardLeft } from "@/components/public/cards/LandscapeCardLeft";
import { MobileArticleCard } from "@/components/public/cards/MobileArticleCard";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { Heart } from "lucide-react";

export function LikedPostsTab() {
  const { user } = useUser();
  const likedArticles = useQuery(
    api.likes.getUserLikedArticles,
    user?.id ? { userId: user.id } : "skip"
  );

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-body-primary">Please sign in to view your liked articles.</p>
      </div>
    );
  }

  if (likedArticles === undefined) {
    return (
      <div className="flex justify-center py-8">
        <LoadingAnimation size={40} />
      </div>
    );
  }

  if (likedArticles.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-12 h-12 text-body-greyed-out mx-auto mb-4" />
        <h3 className="text-lg font-medium text-headline-primary mb-2">No liked posts yet</h3>
        <p className="text-body-greyed-out">
          Articles you like will appear here. Start exploring headlines to find content you enjoy!
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop Layout */}
      <div className="hidden md:block space-y-4">
        {likedArticles.map((article) => (
          <LandscapeCardLeft key={article._id} article={article} />
        ))}
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {likedArticles.map((article, index) => (
          <div key={article._id} className={index > 0 ? "mt-6" : ""}>
            <MobileArticleCard article={article} />
          </div>
        ))}
      </div>
    </div>
  );
}