"use client";

import ProfileForm from "@/components/ProfileForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  return (
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
  );
} 