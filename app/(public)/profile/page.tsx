"use client";

import { Suspense } from "react";
import ProfileForm from "@/components/public/ProfileForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeFilterBar } from "@/components/public/home/BadgeFilterBar";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-brand-background">
      {/* Navigation */}
      <Suspense fallback={<div className="h-16 bg-brand-background border-b border-brand-line" />}>
        <BadgeFilterBar />
      </Suspense>
      
      {/* Profile Content */}
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 