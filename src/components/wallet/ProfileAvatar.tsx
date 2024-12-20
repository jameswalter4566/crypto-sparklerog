import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ProfileAvatarProps {
  displayName?: string | null;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-24 h-24"
};

export const ProfileAvatar = ({ displayName, avatarUrl, size = "md" }: ProfileAvatarProps) => (
  <Avatar className={sizeClasses[size]}>
    <AvatarImage src={avatarUrl || undefined} alt={displayName || "Profile"} />
    <AvatarFallback className="bg-gray-800 text-white">
      {displayName?.charAt(0)?.toUpperCase() || '?'}
    </AvatarFallback>
  </Avatar>
);