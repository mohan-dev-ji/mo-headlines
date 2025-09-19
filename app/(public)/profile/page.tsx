"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import ProfileForm from "@/components/public/ProfileForm";
import { ProfileTabs } from "@/components/public/profile/ProfileTabs";

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"comments" | "liked">("comments");

  return (
    <div className="min-h-screen bg-brand-card-dark">
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

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-normal text-white font-abhaya-libre">
            Profile Settings
          </h1>
          {/* Desktop Close Button */}
          <div className="hidden md:block">
            <Button
              onClick={() => router.push("/")}
              variant="ghost"
              size="icon"
              className="hover:bg-white/10 rounded-lg"
            >
              <X className="h-6 w-6 text-white" />
            </Button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-brand-card rounded-lg p-8 mb-8">
          <ProfileForm />
        </div>

        {/* Tabs Section */}
        <div className="space-y-6">
          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>
    </div>
  );
} 