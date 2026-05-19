import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

// Returns first letter of username, uppercased
export function getUserInitial(username: string): string {
  return (username || "A").charAt(0).toUpperCase();
}

// Deterministic pastel color based on username
export function getAvatarColor(username: string): string {
  const colors = [
    "bg-blush-200 text-blush-700",
    "bg-rose-200 text-rose-700",
    "bg-violet-200 text-violet-700",
    "bg-amber-200 text-amber-700",
    "bg-emerald-200 text-emerald-700",
    "bg-sky-200 text-sky-700",
    "bg-pink-200 text-pink-700",
    "bg-indigo-200 text-indigo-700",
  ];
  let hash = 0;
  for (let i = 0; i < (username || "A").length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Kept for faculty fallback placeholder color
export function getFacultyAvatarColor(name: string): string {
  return getAvatarColor(name);
}

export function ratingColor(rating: number): string {
  if (rating >= 8) return "text-emerald-500";
  if (rating >= 6) return "text-amber-500";
  return "text-rose-500";
}

export function ratingBg(rating: number): string {
  if (rating >= 8) return "bg-emerald-50 text-emerald-600";
  if (rating >= 6) return "bg-amber-50 text-amber-600";
  return "bg-rose-50 text-rose-600";
}

export function renderStars(rating: number, max = 10) {
  const stars = (rating / max) * 5;
  return Math.round(stars * 2) / 2;
}
