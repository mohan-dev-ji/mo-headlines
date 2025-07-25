"use client";

import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

interface UserAvatarProps {
  userId: string;
  username: string;
  avatarUrl?: string;
}

export function UserAvatar({ userId, username, avatarUrl }: UserAvatarProps) {
  return (
    <Avatar className="h-8 w-8">
      {avatarUrl ? (
        <AvatarImage 
          src={avatarUrl} 
          className="object-cover"
        />
      ) : (
        <AvatarImage 
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`} 
          className="object-cover"
        />
      )}
      <AvatarFallback>{username[0]}</AvatarFallback>
    </Avatar>
  );
} 