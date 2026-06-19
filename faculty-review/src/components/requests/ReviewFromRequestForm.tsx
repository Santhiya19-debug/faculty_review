"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { RATING_CATEGORIES } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Props {
  facultyName: string;
  onClose: () => void;
}

export default function ReviewFromRequestForm({ facultyName, onClose }: Props) {
  const { user } = useAuth();
  const router = useRouter();

  const [ratings, setRatings] = useState<Record<string, number>>(
    RATING_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.key]: 5 }), {})
  );
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) { toast.error("Please sign in first"); return; }
    if (!content.trim()) { toast.error("Please write your review"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/submit-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facultyName,
          strictness: ratings.strictness,
          internal_marks: ratings.internal_marks,
          cat_correction: ratings.cat_correction,
          teaching_quality: ratings.teaching_quality,
          attendance_flexibility: ratings.attendance_flexibility,
          student_friendliness: ratings.student_friendliness,
          content: content.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          toast.error("You've already reviewed this faculty");
          // Still redirect them to the faculty page
          if (data.facultyId) router.push(`/faculty/${data.facultyId}`);
        } else {
          toast.error(data.error || "Failed to submit");
        }
        return;
      }

      toast.success(
        data.isNewFaculty
          ? "Faculty created and review submitted! 🎉"
          : "Review submitted! 🎉"
      );
      onClose();
      router.push(`/faculty/${data.facultyId}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="sticky top-0 bg-white rounded-t-3xl px-5 pt-5 pb-3 border-b border-rose-50 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-lg text-gray-800">Write a Review</h3>
              <p className="text-xs text-gray-500">{facultyName}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-rose-50 rounded-xl transition-colors">
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-5">
          <div className="bg-blush-50 rounded-xl p-3 border border-blush-100">
            <p className="text-xs font-medium text-blush-600">
              ✨ Submitting this review will automatically make{" "}
              <strong>{facultyName}</strong> available on the platform.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rate Each Category (1–10)</p>
            {RATING_CATEGORIES.map(cat => (
              <div key={cat.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700">{cat.emoji} {cat.label}</span>
                  <span className="font-bold text-blush-500 text-sm">{ratings[cat.key]}/10</span>
                </div>
                <input
                  type="range" min={1} max={10} step={1}
                  value={ratings[cat.key]}
                  onChange={e => setRatings(prev => ({ ...prev, [cat.key]: Number(e.target.value) }))}
                  className="w-full accent-blush-500"
                />
                <div className="flex justify-between text-xs text-gray-300 mt-0.5">
                  <span>1</span><span>10</span>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              Your Review
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Share your honest experience. Your identity will remain anonymous..."
              className="input-field resize-none"
              rows={4}
              maxLength={1000}
            />
            <p className="text-right text-xs text-gray-300 mt-1">{content.length}/1000</p>
          </div>

          <p className="text-xs text-gray-400 bg-rose-50 rounded-xl p-3">
            🔒 Your review is completely anonymous. We never show your real name.
          </p>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}