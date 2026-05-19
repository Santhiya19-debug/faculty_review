import { getUserInitial, getAvatarColor, cn } from "@/lib/utils";

interface AvatarProps {
  username: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  xs: "w-5 h-5 text-[10px]",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-16 h-16 text-2xl",
};

export default function Avatar({ username, size = "sm", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold shrink-0 select-none",
        sizeMap[size],
        getAvatarColor(username),
        className
      )}
      aria-label={username}
    >
      {getUserInitial(username)}
    </div>
  );
}
