"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number; // out of 10
  size?: number;
  showValue?: boolean;
  className?: string;
}

export default function StarRating({ rating, size = 14, showValue = true, className }: StarRatingProps) {
  // Convert 10-point scale to 5 stars
  const stars = (rating / 10) * 5;
  const fullStars = Math.floor(stars);
  const hasHalf = stars % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} size={size} className="fill-blush-400 text-blush-400" />
        ))}
        {hasHalf && (
          <div className="relative" style={{ width: size, height: size }}>
            <Star size={size} className="text-rose-200 fill-rose-200" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star size={size} className="fill-blush-400 text-blush-400" />
            </div>
          </div>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} size={size} className="text-rose-200 fill-rose-200" />
        ))}
      </div>
      {showValue && (
        <span className="text-xs font-semibold text-gray-600 ml-0.5">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
