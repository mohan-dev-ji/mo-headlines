"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { CheckCircle } from "lucide-react";

export default function ProfileForm() {
  const { user, isLoaded } = useUser();
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Original values to track changes
  const [originalUsername, setOriginalUsername] = useState("");
  const [originalDescription, setOriginalDescription] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");

  // Dialog state
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (user) {
      const userUsername = user.unsafeMetadata?.username as string || "";
      const userDescription = user.unsafeMetadata?.description as string || "";
      const userEmail = user.emailAddresses[0]?.emailAddress || "";

      setUsername(userUsername);
      setDescription(userDescription);
      setEmail(userEmail);

      // Store original values
      setOriginalUsername(userUsername);
      setOriginalDescription(userDescription);
      setOriginalEmail(userEmail);
    }
  }, [user]);

  // Check if any changes have been made
  const hasChanges = username !== originalUsername ||
                    description !== originalDescription ||
                    email !== originalEmail ||
                    newPassword.length > 0;

  if (!isLoaded) {
    return null;
  }

  const handleSave = async () => {
    try {
      // Update username and description
      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          username,
          description,
        },
      });

      // Update email if changed
      if (email !== user?.emailAddresses[0]?.emailAddress) {
        await user?.createEmailAddress({ email });
      }

      // Update password if provided
      if (newPassword && newPassword === confirmPassword) {
        await user?.updatePassword({ newPassword });
        setNewPassword("");
        setConfirmPassword("");
      } else if (newPassword && newPassword !== confirmPassword) {
        setErrorMessage("Passwords don't match. Please ensure both password fields are identical.");
        setShowErrorDialog(true);
        return;
      }

      // Update original values to reflect the saved state
      setOriginalUsername(username);
      setOriginalDescription(description);
      setOriginalEmail(email);

      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage("There was an error updating your profile. Please try again.");
      setShowErrorDialog(true);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await user?.setProfileImage({ file });
    } catch (error) {
      console.error("Error updating profile image:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Image */}
      <div className="flex items-center gap-6">
        <div className="relative h-24 w-24 rounded-full overflow-hidden">
          <Avatar className="h-full w-full">
            <AvatarImage
              src={user?.imageUrl}
              className="object-cover"
            />
            <AvatarFallback className="text-xl">{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
          </Avatar>
        </div>
        <Button
          variant="outline"
          size="default"
          asChild
          className="bg-white text-black border-gray-300 hover:bg-gray-100"
        >
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            Change Picture
          </label>
        </Button>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Username */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Username</label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-brand-background border-zinc-600 text-white placeholder:text-zinc-400 h-12"
            placeholder="Enter username"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Password</label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="bg-brand-background border-zinc-600 text-white placeholder:text-zinc-400 h-12"
            placeholder="Enter password"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-brand-background border-zinc-600 text-white placeholder:text-zinc-400 h-12"
            placeholder="Enter email"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-brand-background border-zinc-600 text-white placeholder:text-zinc-400 min-h-[100px] resize-none"
            placeholder="Enter description"
          />
        </div>

        {/* Save Button - Only show if changes have been made */}
        {hasChanges && (
          <div className="pt-4">
            <Button
              onClick={handleSave}
              className="bg-brand-primary text-black hover:bg-cyan-300 px-8 py-2 h-12"
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="bg-brand-card border-brand-line">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-6 w-6 text-green-400" />
              <DialogTitle className="text-white">Profile Updated Successfully</DialogTitle>
            </div>
            <DialogDescription className="text-body-secondary">
              Your profile changes have been saved successfully.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowSuccessDialog(false)}
              className="bg-brand-primary text-black hover:bg-cyan-300"
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="bg-brand-card border-brand-line">
          <DialogHeader>
            <DialogTitle className="text-white">Error</DialogTitle>
            <DialogDescription className="text-body-secondary">
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowErrorDialog(false)}
              variant="outline"
              className="border-zinc-600 text-white hover:bg-zinc-700"
            >
              Try Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 