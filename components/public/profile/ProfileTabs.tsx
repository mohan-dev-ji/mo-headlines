"use client";

import { LikedPostsTab } from "./LikedPostsTab";
import { CommentsTab } from "./CommentsTab";

interface ProfileTabsProps {
  activeTab: "comments" | "liked";
  onTabChange: (tab: "comments" | "liked") => void;
}

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-2">
        <button
          onClick={() => onTabChange("liked")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "liked"
              ? "bg-cyan-950 text-cyan-400"
              : "bg-brand-card text-body-greyed-out hover:bg-brand-card/80"
          }`}
        >
          Liked Articles
        </button>
        <button
          onClick={() => onTabChange("comments")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "comments"
              ? "bg-cyan-950 text-cyan-400"
              : "bg-brand-card text-body-greyed-out hover:bg-brand-card/80"
          }`}
        >
          Comments
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "liked" ? <LikedPostsTab /> : <CommentsTab />}
    </div>
  );
}