"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MessageSquare, BadgeCheck } from "lucide-react";
import { Faculty } from "@/types";
import StarRating from "@/components/ui/StarRating";
import { getFacultyAvatarUrl, cn } from "@/lib/utils";

interface FacultyCardProps {
  faculty: Faculty;
  index?: number;
  compact?: boolean;
}

export default function FacultyCard({ faculty, index = 0, compact = false }: FacultyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
    >
      <Link href={`/faculty/${faculty.id}`}>
        <div className={cn("card card-hover cursor-pointer group", compact ? "p-3" : "p-4")}>
          {/* Avatar + Name */}
          <div className="flex items-center gap-3 mb-3">
            <div className={cn("rounded-full overflow-hidden border-2 border-blush-100 shrink-0 bg-rose-50",
              compact ? "w-10 h-10" : "w-12 h-12"
            )}>
              <Image
                src={faculty.avatar_url || getFacultyAvatarUrl(faculty.name)}
                alt={faculty.name}
                width={compact ? 40 : 48}
                height={compact ? 40 : 48}
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className={cn("font-semibold text-gray-800 truncate group-hover:text-blush-600 transition-colors",
                  compact ? "text-sm" : "text-sm sm:text-base"
                )}>
                  {faculty.name}
                </h3>
                {faculty.is_verified && (
                  <BadgeCheck size={14} className="text-blush-500 shrink-0" />
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">
                {faculty.departments?.name || faculty.designation || "Faculty"}
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-between mb-3">
            <StarRating rating={faculty.overall_rating} size={compact ? 12 : 13} />
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <MessageSquare size={11} />
              <span>{faculty.review_count}</span>
            </div>
          </div>

          {/* Department badge */}
          {faculty.departments && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="badge bg-blush-50 text-blush-600 border border-blush-100">
                {faculty.departments.icon} {faculty.departments.name}
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
