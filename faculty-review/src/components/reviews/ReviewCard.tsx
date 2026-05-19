"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, Flag, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Review, RATING_CATEGORIES } from "@/types";
import StarRating from "@/components/ui/StarRating";
import Avatar from "@/components/ui/Avatar";
import { timeAgo, cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

interface ReviewCardProps {
  review: Review;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  showFacultyLink?: boolean;
}

export default function ReviewCard({ review, onEdit, onDelete }: ReviewCardProps) {
  const { user } = useAuth();
  const [vote, setVote] = useState<'up' | 'down' | null>(review.user_vote || null);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const supabase = createClient();

  const isOwner = user?.id === review.user_id;
  const username = review.profiles?.username || "Anonymous";
  const contentPreview = review.content.length > 200 && !expanded
    ? review.content.slice(0, 200) + "..."
    : review.content;

  const handleVote = async (type: 'up' | 'down') => {
    if (!user) { toast.error("Please sign in to vote"); return; }
    const newVote = vote === type ? null : type;
    const prevVote = vote;
    const prevCount = helpfulCount;
    setVote(newVote);
    const diff = (newVote === 'up' ? 1 : newVote === 'down' ? -1 : 0) -
                 (prevVote === 'up' ? 1 : prevVote === 'down' ? -1 : 0);
    setHelpfulCount(prev => prev + diff);
    try {
      if (prevVote) {
        await supabase.from("votes").delete().eq("review_id", review.id).eq("user_id", user.id);
      }
      if (newVote) {
        await supabase.from("votes").upsert({ review_id: review.id, user_id: user.id, vote_type: newVote });
      }
    } catch {
      setVote(prevVote);
      setHelpfulCount(prevCount);
      toast.error("Failed to vote");
    }
  };

  const handleReport = async () => {
    if (!user) { toast.error("Please sign in to report"); return; }
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      review_id: review.id,
      reason: "inappropriate",
    });
    if (!error) toast.success("Report submitted. Thank you!");
    else toast.error("Already reported");
    setMenuOpen(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <Avatar username={username} size="sm" />
          <div>
            <p className="text-sm font-semibold text-gray-700">{username}</p>
            <p className="text-xs text-gray-400">
              {timeAgo(review.created_at)}
              {review.is_edited && <span className="ml-1 text-gray-300">(edited)</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={review.overall_rating} size={12} />
          {isOwner && (
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                <MoreHorizontal size={15} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-card-hover border border-rose-100 py-1 z-10">
                  <button onClick={() => { onEdit?.(review); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-600 hover:bg-rose-50 transition-colors">
                    <Pencil size={12} /> Edit Review
                  </button>
                  <button onClick={() => { onDelete?.(review.id); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-rose-500 hover:bg-rose-50 transition-colors">
                    <Trash2 size={12} /> Delete Review
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content — no title, just review text */}
      <p className="text-sm text-gray-600 leading-relaxed mb-3">
        {contentPreview}
        {review.content.length > 200 && (
          <button onClick={() => setExpanded(!expanded)} className="text-blush-500 font-medium ml-1 text-xs hover:underline">
            {expanded ? "less" : "more"}
          </button>
        )}
      </p>

      {/* Mini rating grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-4 bg-rose-50/50 rounded-xl p-3">
        {RATING_CATEGORIES.map(cat => {
          const value = review[cat.key] as number;
          return (
            <div key={cat.key} className="flex items-center gap-1.5 text-xs">
              <span>{cat.emoji}</span>
              <span className="text-gray-500 truncate flex-1">{cat.label.split(' ')[0]}</span>
              <span className="font-bold text-gray-700 shrink-0">{value}</span>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-rose-50">
        <button
          onClick={() => handleVote('up')}
          className={cn("flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-xl transition-all",
            vote === 'up' ? "bg-emerald-50 text-emerald-600" : "text-gray-400 hover:bg-gray-50")}
        >
          <ThumbsUp size={13} />
          <span>Helpful {helpfulCount > 0 && `(${helpfulCount})`}</span>
        </button>
        <button
          onClick={() => handleVote('down')}
          className={cn("flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-xl transition-all",
            vote === 'down' ? "bg-rose-50 text-rose-500" : "text-gray-400 hover:bg-gray-50")}
        >
          <ThumbsDown size={13} />
        </button>
        <button onClick={handleReport} className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-xl text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-all ml-auto">
          <Flag size={12} />
          <span className="hidden sm:inline">Report</span>
        </button>
      </div>
    </motion.div>
  );
}
