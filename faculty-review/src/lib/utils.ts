import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getAvatarUrl(username: string) {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(username)}&backgroundColor=ffc9d5,ffd5dd,ffe0e6&backgroundType=gradientLinear`;
}

export function getFacultyAvatarUrl(name: string) {
  return `https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(name)}&backgroundColor=ffc9d5,ffd5dd`;
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
  // Convert 10-point to 5-star
  const stars = (rating / max) * 5;
  return Math.round(stars * 2) / 2; // Round to nearest 0.5
}
