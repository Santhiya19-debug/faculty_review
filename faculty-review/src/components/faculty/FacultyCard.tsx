"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MessageSquare, BadgeCheck, Sparkles } from "lucide-react";
import { Faculty } from "@/types";
import StarRating from "@/components/ui/StarRating";
import Avatar from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

interface FacultyCardProps {
  faculty: Faculty;
  index?: number;
  compact?: boolean;
}

// Feature 3: returns true if last_reviewed_at is within the last 7 days
function isRecentlyReviewed(lastReviewedAt?: string | null): boolean {
  if (!lastReviewedAt) return false;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return new Date(lastReviewedAt) > sevenDaysAgo;
}

export default function FacultyCard({ faculty, index = 0, compact = false }: FacultyCardProps) {
  const dept = (faculty as any).departments;
  const school = (faculty as any).schools;
  const recentlyReviewed = isRecentlyReviewed((faculty as any).last_reviewed_at);

  const subtitle =
    dept?.name ||
    (school?.name ? school.name.match(/\(([^)]+)\)/)?.[1] : null) ||
    faculty.designation ||
    "Faculty";

  const displayRating =
    faculty.overall_rating > 0
      ? faculty.overall_rating
      : faculty.teaching_quality != null
      ? ((faculty.strictness || 5) +
          (faculty.teaching_quality || 5) +
          (faculty.attendance_flexibility || 5) +
          (faculty.marks_leniency || 5)) /
        4
      : 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
    >
      <Link href={`/faculty/${faculty.id}`}>
        <div className={cn("card card-hover cursor-pointer group relative", compact ? "p-3" : "p-4")}>

          {/* Feature 3: Recently Reviewed badge — auto-disappears after 7 days */}
          {recentlyReviewed && (
            <div className="absolute -top-2 left-3 z-10">
              <span className="flex items-center gap-1 bg-blush-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-pink whitespace-nowrap">
                <Sparkles size={9} />
                Recently Reviewed
              </span>
            </div>
          )}

          {/* Avatar */}
          <div className="flex items-center gap-3 mb-3">
            {faculty.avatar_url ? (
              <div
                className={cn(
                  "rounded-full overflow-hidden border-2 border-blush-100 shrink-0 bg-rose-50",
                  compact ? "w-10 h-10" : "w-12 h-12"
                )}
              >
                <Image
                  src={faculty.avatar_url}
                  alt={faculty.name}
                  width={compact ? 40 : 48}
                  height={compact ? 40 : 48}
                  className="object-cover"
                />
              </div>
            ) : (
              <Avatar
                username={faculty.name}
                size={compact ? "sm" : "md"}
                className="border-2 border-blush-100"
              />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3
                  className={cn(
                    "font-semibold text-gray-800 truncate group-hover:text-blush-600 transition-colors",
                    compact ? "text-sm" : "text-sm sm:text-base"
                  )}
                >
                  {faculty.name}
                </h3>
                {faculty.is_verified && (
                  <BadgeCheck size={14} className="text-blush-500 shrink-0" />
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">{subtitle}</p>
            </div>
          </div>

          {/* Rating row */}
          <div className="flex items-center justify-between mb-3">
            <StarRating rating={displayRating} size={compact ? 12 : 13} />
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <MessageSquare size={11} />
              <span>{faculty.review_count || 0}</span>
            </div>
          </div>

          {/* Department / School badge */}
          {(dept || school) && (
            <div className="flex flex-wrap gap-1">
              {dept && (
                <span className="badge bg-blush-50 text-blush-600 border border-blush-100 truncate max-w-full">
                  {dept.icon ? `${dept.icon} ` : ""}
                  {dept.name}
                </span>
              )}
              {!dept && school && (
                <span className="badge bg-rose-50 text-rose-500 border border-rose-100 truncate max-w-full">
                  {school.name.match(/\(([^)]+)\)/)?.[1] || school.name}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}