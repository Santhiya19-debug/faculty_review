"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, Star, FileText, Pencil, Check, X } from "lucide-react";
import { Profile } from "@/types";
import { getAvatarUrl, timeAgo } from "@/lib/utils";
import StarRating from "@/components/ui/StarRating";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

interface Props {
  profile: Profile;
  myReviews: any[];
  myRequests: any[];
  email: string;
}

export default function ProfileClient({ profile, myReviews, myRequests, email }: Props) {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"reviews" | "requests">(
    searchParams.get("tab") === "requests" ? "requests" : "reviews"
  );
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(profile?.username || "");
  const [saving, setSaving] = useState(false);
  const { signOut, refreshProfile } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const handleSaveUsername = async () => {
    if (!newUsername.trim() || newUsername === profile?.username) {
      setEditingUsername(false);
      return;
    }
    if (newUsername.length < 3) { toast.error("Username must be at least 3 characters"); return; }
    if (!/^[a-z0-9_]+$/.test(newUsername)) { toast.error("Only lowercase letters, numbers, and underscores"); return; }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ username: newUsername.trim() })
      .eq("id", profile.id);

    if (error) {
      toast.error(error.code === "23505" ? "Username taken" : "Failed to update username");
    } else {
      toast.success("Username updated!");
      await refreshProfile();
      setEditingUsername(false);
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-5 sm:p-7 mb-6"
      >
        <div className="flex items-start gap-4">
          <Image
            src={getAvatarUrl(profile?.username || "user")}
            alt="Avatar"
            width={64}
            height={64}
            className="rounded-2xl border-2 border-blush-200 shrink-0"
          />
          <div className="flex-1 min-w-0">
            {/* Username */}
            {editingUsername ? (
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="text"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value.toLowerCase().replace(/\s/g, "_"))}
                  className="input-field py-1.5 text-sm font-semibold"
                  autoFocus
                  maxLength={30}
                />
                <button onClick={handleSaveUsername} disabled={saving} className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors">
                  <Check size={15} />
                </button>
                <button onClick={() => { setEditingUsername(false); setNewUsername(profile?.username || ""); }} className="p-1.5 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-xl transition-colors">
                  <X size={15} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display font-bold text-xl text-gray-800">{profile?.username}</h1>
                <button onClick={() => setEditingUsername(true)} className="p-1 text-gray-400 hover:text-blush-500 transition-colors">
                  <Pencil size={13} />
                </button>
              </div>
            )}
            <p className="text-xs text-gray-400">{email}</p>
            <div className="flex items-center gap-3 mt-3">
              <div className="text-center">
                <p className="font-bold text-gray-800 text-lg">{myReviews.length}</p>
                <p className="text-xs text-gray-400">Reviews</p>
              </div>
              <div className="w-px h-8 bg-rose-100" />
              <div className="text-center">
                <p className="font-bold text-gray-800 text-lg">{myRequests.length}</p>
                <p className="text-xs text-gray-400">Requests</p>
              </div>
            </div>
          </div>
          <button onClick={handleSignOut} className="flex items-center gap-1.5 text-xs font-medium text-rose-400 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl transition-colors shrink-0">
            <LogOut size={13} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-rose-50 rounded-2xl p-1 mb-5">
        {(["reviews", "requests"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              tab === t ? "bg-white text-blush-600 shadow-soft" : "text-gray-500"
            }`}
          >
            {t === "reviews" ? <Star size={14} /> : <FileText size={14} />}
            My {t === "reviews" ? "Reviews" : "Requests"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "reviews" ? (
        <div className="space-y-3">
          {myReviews.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📝</p>
              <p className="font-semibold text-gray-700">No reviews yet</p>
              <p className="text-sm text-gray-400 mt-1">Start reviewing faculties you&apos;ve encountered</p>
              <Link href="/search" className="btn-primary inline-flex mt-4 text-sm py-2">
                Browse Faculties
              </Link>
            </div>
          ) : (
            myReviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link href={`/faculty/${review.faculty_id}`}>
                  <div className="card card-hover p-4 cursor-pointer">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="text-xs font-semibold text-blush-500 mb-0.5">
                          {review.faculties?.name}
                        </p>
                        <h3 className="font-semibold text-gray-800 text-sm">{review.title}</h3>
                      </div>
                      <StarRating rating={review.overall_rating} size={12} />
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{review.content}</p>
                    <div className="flex items-center gap-2">
                      {review.faculties?.departments && (
                        <span className="badge bg-blush-50 text-blush-600 border border-blush-100 text-xs">
                          {review.faculties.departments.icon} {review.faculties.departments.name}
                        </span>
                      )}
                      <span className="text-xs text-gray-300 ml-auto">{timeAgo(review.created_at)}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {myRequests.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📬</p>
              <p className="font-semibold text-gray-700">No requests yet</p>
              <p className="text-sm text-gray-400 mt-1">Request a faculty you want to see reviewed</p>
              <Link href="/requests" className="btn-primary inline-flex mt-4 text-sm py-2">
                Go to Requests
              </Link>
            </div>
          ) : (
            myRequests.map((req, i) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">{req.faculty_name}</h3>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {req.departments && (
                        <span className="badge bg-blush-50 text-blush-600 border border-blush-100">
                          {req.departments.icon} {req.departments.name}
                        </span>
                      )}
                      <span className={`badge border ${
                        req.status === "fulfilled" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        req.status === "rejected" ? "bg-rose-50 text-rose-500 border-rose-100" :
                        "bg-amber-50 text-amber-600 border-amber-100"
                      }`}>
                        {req.status === "pending" ? "⏳ Pending" : req.status === "fulfilled" ? "✅ Fulfilled" : "❌ Rejected"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-bold text-blush-500 shrink-0">
                    ↑ {req.upvotes}
                  </div>
                </div>
                <p className="text-xs text-gray-400">{timeAgo(req.created_at)}</p>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
