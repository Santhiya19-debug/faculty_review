"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getAvatarUrl, timeAgo } from "@/lib/utils";
import StarRating from "@/components/ui/StarRating";

interface RecentReviewsProps {
  reviews: any[];
}

export default function RecentReviews({ reviews }: RecentReviewsProps) {
  if (reviews.length === 0) return null;

  return (
    <section className="py-10 sm:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="section-title"
          >
            Recent Reviews
          </motion.h2>
          <Link href="/search" className="flex items-center gap-1 text-sm font-semibold text-blush-500 hover:text-blush-600 transition-colors">
            View All <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link href={`/faculty/${review.faculty_id}`}>
                <div className="card card-hover p-4 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <Image
                      src={getAvatarUrl(review.profiles?.username || "anon")}
                      alt="reviewer"
                      width={36}
                      height={36}
                      className="rounded-full border border-rose-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-gray-600">
                          {review.profiles?.username || "Anonymous"}
                        </span>
                        <StarRating rating={review.overall_rating} size={11} />
                      </div>
                      <p className="text-xs text-blush-500 font-medium mb-1.5">
                        on {review.faculties?.name}
                      </p>
                      <p className="text-sm font-semibold text-gray-800 mb-1 truncate">{review.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{review.content}</p>
                      <p className="text-xs text-gray-300 mt-2">{timeAgo(review.created_at)}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
