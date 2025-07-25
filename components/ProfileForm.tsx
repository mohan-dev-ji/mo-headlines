"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Pencil, Save, X, Upload } from "lucide-react";

export default function ProfileForm() {
  const { user, isLoaded } = useUser();
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEditing, setIsEditing] = useState({
    username: false,
    description: false,
    email: false,
    password: false,
  });

  useEffect(() => {
    if (user) {
      setUsername(user.unsafeMetadata?.username as string || "");
      setDescription(user.unsafeMetadata?.description as string || "");
      setEmail(user.emailAddresses[0]?.emailAddress || "");
    }
  }, [user]);

  if (!isLoaded) {
    return null;
  }

  const handleSave = async (field: keyof typeof isEditing) => {
    try {
      if (field === 'username' || field === 'description') {
        await user?.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            [field]: field === 'username' ? username : description,
          },
        });
      } else if (field === 'email') {
        // Email updates require verification, so we'll use Clerk's built-in method
        await user?.createEmailAddress({ email });
      } else if (field === 'password') {
        if (newPassword !== confirmPassword) {
          alert("Passwords don't match");
          return;
        }
        // Use Clerk's built-in password update method
        await user?.updatePassword({ newPassword });
        setNewPassword("");
        setConfirmPassword("");
      }
      setIsEditing({ ...isEditing, [field]: false });
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    }
  };

  const handleCancel = (field: keyof typeof isEditing) => {
    setIsEditing({ ...isEditing, [field]: false });
    // Reset values to original
    if (user) {
      if (field === 'username') setUsername(user.unsafeMetadata?.username as string || "");
      if (field === 'description') setDescription(user.unsafeMetadata?.description as string || "");
      if (field === 'email') setEmail(user.emailAddresses[0]?.emailAddress || "");
      if (field === 'password') {
        setNewPassword("");
        setConfirmPassword("");
      }
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
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 rounded-full overflow-hidden">
          <Avatar className="h-full w-full">
            <AvatarImage 
              src={user?.imageUrl} 
              className="object-cover"
            />
            <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="outline" size="sm" asChild>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Change Photo
              </div>
            </label>
          </Button>
          <p className="text-xs text-muted-foreground">
            JPG, GIF or PNG. Max size of 10MB
          </p>
        </div>
      </div>

      {/* Username */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Username</label>
        {isEditing.username ? (
          <div className="flex gap-2">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1"
            />
            <Button size="sm" onClick={() => handleSave('username')}>
              <Save className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleCancel('username')}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-sm">{username || "Not set"}</p>
            <Button size="sm" variant="ghost" onClick={() => setIsEditing({ ...isEditing, username: true })}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        {isEditing.description ? (
          <div className="flex gap-2">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1"
            />
            <Button size="sm" onClick={() => handleSave('description')}>
              <Save className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleCancel('description')}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-sm">{description || "Not set"}</p>
            <Button size="sm" variant="ghost" onClick={() => setIsEditing({ ...isEditing, description: true })}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        {isEditing.email ? (
          <div className="flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button size="sm" onClick={() => handleSave('email')}>
              <Save className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleCancel('email')}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-sm">{email}</p>
            <Button size="sm" variant="ghost" onClick={() => setIsEditing({ ...isEditing, email: true })}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Password</label>
        {isEditing.password ? (
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleSave('password')}>
                <Save className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleCancel('password')}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-sm">••••••••</p>
            <Button size="sm" variant="ghost" onClick={() => setIsEditing({ ...isEditing, password: true })}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 