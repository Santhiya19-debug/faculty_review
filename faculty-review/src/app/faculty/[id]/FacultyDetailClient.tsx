"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, ChevronLeft, PenLine, Share2 } from "lucide-react";
import { Faculty, Review, ImportedReview, RATING_CATEGORIES } from "@/types";
import StarRating from "@/components/ui/StarRating";
import RatingBar from "@/components/ui/RatingBar";
import ReviewCard from "@/components/reviews/ReviewCard";
import ReviewForm from "@/components/reviews/ReviewForm";
import Avatar from "@/components/ui/Avatar";
import { ratingBg, timeAgo } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

interface Props {
  faculty: Faculty;
  initialReviews: Review[];
  importedReviews: ImportedReview[];
  currentUserId: string | null;
}

export default function FacultyDetailClient({ faculty, initialReviews, importedReviews, currentUserId }: Props) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [tab, setTab] = useState<"reviews" | "community" | "about">("reviews");
  const { user } = useAuth();
  const supabase = createClient();

  const dept = (faculty as any).departments;
  const school = (faculty as any).schools;
  const userReview = reviews.find(r => r.user_id === currentUserId);

  // Compute display rating from imported metrics if no overall_rating
  const hasImportedMetrics = faculty.teaching_quality != null;
  const importedRating = hasImportedMetrics
    ? (((faculty.strictness || 5) + (faculty.teaching_quality || 5) + (faculty.attendance_flexibility || 5) + (faculty.marks_leniency || 5)) / 4)
    : null;
  const displayRating = faculty.overall_rating > 0 ? faculty.overall_rating : (importedRating || 5);

  const refreshReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*, profiles(username)")
      .eq("faculty_id", faculty.id)
      .order("helpful_count", { ascending: false });
    if (data) {
      let withVotes = data;
      if (user) {
        const { data: votes } = await supabase
          .from("votes").select("review_id, vote_type").eq("user_id", user.id);
        const voteMap = new Map(votes?.map(v => [v.review_id, v.vote_type]) || []);
        withVotes = data.map(r => ({ ...r, user_vote: voteMap.get(r.id) || null }));
      }
      setReviews(withVotes);
    }
    setShowForm(false);
    setEditingReview(null);
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Delete this review?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
    if (!error) {
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      toast.success("Review deleted");
    } else {
      toast.error("Failed to delete");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Back */}
      <Link href="/search" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blush-500 transition-colors mb-6">
        <ChevronLeft size={16} /> Back to Search
      </Link>

      {/* Faculty Header */}
      <div className="card p-5 sm:p-7 mb-6">
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-7">
          {faculty.avatar_url ? (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-blush-100 shrink-0 bg-rose-50">
              <Image src={faculty.avatar_url} alt={faculty.name} width={96} height={96} className="object-cover w-full h-full" />
            </div>
          ) : (
            <Avatar username={faculty.name} size="lg" className="rounded-2xl border-2 border-blush-100 shrink-0 w-20 h-20 sm:w-24 sm:h-24 text-3xl" />
          )}

          <div className="flex-1">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-800">{faculty.name}</h1>
                  {faculty.is_verified && <BadgeCheck size={20} className="text-blush-500" />}
                </div>
                {faculty.designation && <p className="text-sm text-gray-500 mb-1">{faculty.designation}</p>}
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {dept && (
                    <span className="badge bg-blush-50 text-blush-600 border border-blush-100">
                      {dept.icon ? `${dept.icon} ` : "📚 "}{dept.name}
                    </span>
                  )}
                  {school && (
                    <span className="badge bg-rose-50 text-rose-500 border border-rose-100">
                      🏫 {school.name.match(/\(([^)]+)\)/)?.[1] || school.name}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={handleShare} className="btn-secondary text-sm py-2 px-3 flex items-center gap-1.5">
                <Share2 size={14} /> Share
              </button>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <div className={`px-3 py-1.5 rounded-xl text-lg font-bold ${ratingBg(displayRating)}`}>
                {displayRating.toFixed(1)}
              </div>
              <div>
                <StarRating rating={displayRating} size={16} />
                <p className="text-xs text-gray-400 mt-0.5">
                  {reviews.length > 0
                    ? `Based on ${reviews.length} student ${reviews.length === 1 ? "review" : "reviews"}`
                    : importedReviews.length > 0
                    ? `${importedReviews.length} community reviews`
                    : "No reviews yet"}
                </p>
              </div>
            </div>

            {faculty.subjects && faculty.subjects.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {faculty.subjects.map(s => (
                  <span key={s} className="badge bg-gray-50 text-gray-500 border border-gray-100">{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-rose-50 rounded-2xl p-1 mb-6">
        {[
          { key: "reviews", label: `Reviews (${reviews.length})` },
          { key: "community", label: `Community (${importedReviews.length})` },
          { key: "about", label: "About" },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              tab === t.key ? "bg-white text-blush-600 shadow-soft" : "text-gray-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* About tab */}
      {tab === "about" && (
        <div className="space-y-4">
          {hasImportedMetrics && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-700 mb-4">Faculty Metrics</h3>
              <div className="space-y-3">
                <RatingBar label="Teaching Quality" emoji="🎓" value={faculty.teaching_quality || 5} />
                <RatingBar label="Strictness Level" emoji="😤" value={faculty.strictness || 5} />
                <RatingBar label="Attendance Flexibility" emoji="📅" value={faculty.attendance_flexibility || 5} />
                <RatingBar label="Marks Leniency" emoji="📊" value={faculty.marks_leniency || 5} />
              </div>
              <p className="text-xs text-gray-400 mt-3">* Metrics auto-generated from community reviews</p>
            </div>
          )}
          {/* User review breakdown */}
          {reviews.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-700 mb-4">Student Rating Breakdown</h3>
              <div className="space-y-3">
                {RATING_CATEGORIES.map(cat => {
                  const avgKey = `avg_${cat.key}` as keyof Faculty;
                  const value = (faculty[avgKey] as number) || 0;
                  return <RatingBar key={cat.key} label={cat.label} emoji={cat.emoji} value={value} />;
                })}
              </div>
            </div>
          )}
          {faculty.bio && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-700 mb-2">About</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{faculty.bio}</p>
            </div>
          )}
        </div>
      )}

      {/* User reviews tab */}
      {tab === "reviews" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">{reviews.length} student {reviews.length === 1 ? "review" : "reviews"}</p>
            {user ? (
              !userReview ? (
                <button onClick={() => { setEditingReview(null); setShowForm(true); }} className="btn-primary text-sm py-2 flex items-center gap-2">
                  <PenLine size={14} /> Write Review
                </button>
              ) : (
                <button onClick={() => { setEditingReview(userReview); setShowForm(true); }} className="btn-secondary text-sm py-2 flex items-center gap-2">
                  <PenLine size={14} /> Edit My Review
                </button>
              )
            ) : (
              <Link href="/auth/login" className="btn-primary text-sm py-2 flex items-center gap-2">
                <PenLine size={14} /> Write Review
              </Link>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📝</p>
              <p className="font-semibold text-gray-700">No student reviews yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Be the first! Community reviews are in the Community tab.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onEdit={r => { setEditingReview(r); setShowForm(true); }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Community (imported) reviews tab */}
      {tab === "community" && (
        <div className="space-y-3">
          {importedReviews.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">💬</p>
              <p className="font-semibold text-gray-700">No community reviews yet</p>
            </div>
          ) : (
            importedReviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-blush-600">
                    {(review.source || "A").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">{review.source || "Community"}</p>
                    <p className="text-xs text-gray-400">{timeAgo(review.created_at)}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{review.review_text}</p>
              </motion.div>
            ))
          )}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <ReviewForm
            facultyId={faculty.id}
            facultyName={faculty.name}
            existingReview={editingReview}
            onSuccess={refreshReviews}
            onClose={() => { setShowForm(false); setEditingReview(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
