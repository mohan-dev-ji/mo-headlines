"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import ProfileForm from "@/components/public/ProfileForm";
import { ProfileTabs } from "@/components/public/profile/ProfileTabs";

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"comments" | "liked">("liked");

  return (
    <div className="min-h-screen bg-brand-card-dark py-page-y">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between mb-8">
          <h1 className="text-4xl text-headline-primary font-abhaya-libre md:text-4xl flex-1 pr-4">
            Profile Settings
          </h1>
          {/* Close Button - Desktop only, next to title */}
          <div className="hidden md:block">
            <Button
              onClick={() => router.push("/")}
              variant="ghost"
              size="icon"
              className="bg-brand-card hover:bg-white/20 rounded-lg"
            >
              <X className="h-6 w-6 text-white" />
            </Button>
          </div>
        </div>

        {/* Mobile Close Button - Fixed position */}
        <div className="fixed top-6 right-6 z-10 md:hidden">
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            size="icon"
            className="bg-white/90 hover:bg-white rounded-lg shadow-lg"
          >
            <X className="h-6 w-6 text-zinc-600" />
          </Button>
        </div>

        {/* Profile Form Section */}
        <div className="bg-brand-card rounded-lg p-6 mb-8">
          <ProfileForm />
        </div>

        {/* Profile Tabs Section */}
        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
} 