"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronUp, ChevronDown, X } from "lucide-react";
import { Department, FacultyRequest } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { timeAgo, getAvatarUrl, cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Props {
  initialRequests: FacultyRequest[];
  departments: Department[];
  currentUserId: string | null;
}

export default function RequestsClient({ initialRequests, departments, currentUserId }: Props) {
  const [requests, setRequests] = useState<FacultyRequest[]>(initialRequests);
  const [showForm, setShowForm] = useState(false);
  const [facultyName, setFacultyName] = useState("");
  const [deptId, setDeptId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const supabase = createClient();

  const handleVote = async (requestId: string, currentlyVoted: boolean) => {
    if (!user) { toast.error("Please sign in to vote"); return; }

    // Optimistic
    setRequests(prev => prev.map(r =>
      r.id === requestId
        ? { ...r, upvotes: currentlyVoted ? r.upvotes - 1 : r.upvotes + 1, user_voted: !currentlyVoted }
        : r
    ));

    try {
      if (currentlyVoted) {
        await supabase.from("request_votes").delete()
          .eq("request_id", requestId).eq("user_id", user.id);
      } else {
        await supabase.from("request_votes").insert({ request_id: requestId, user_id: user.id });
      }
    } catch {
      // Revert on error
      setRequests(prev => prev.map(r =>
        r.id === requestId
          ? { ...r, upvotes: currentlyVoted ? r.upvotes + 1 : r.upvotes - 1, user_voted: currentlyVoted }
          : r
      ));
      toast.error("Vote failed");
    }
  };

  const handleSubmit = async () => {
    if (!user) { toast.error("Please sign in first"); return; }
    if (!facultyName.trim()) { toast.error("Faculty name is required"); return; }

    setLoading(true);
    const { error } = await supabase.from("faculty_requests").insert({
      user_id: user.id,
      faculty_name: facultyName.trim(),
      department_id: deptId || null,
      subject: subject.trim() || null,
      description: description.trim() || null,
    });

    if (!error) {
      toast.success("Request submitted! 🎉");
      setShowForm(false);
      setFacultyName(""); setDeptId(""); setSubject(""); setDescription("");
      // Refresh list
      const { data } = await supabase
        .from("faculty_requests")
        .select("*, departments(*), profiles(username)")
        .eq("status", "pending")
        .order("upvotes", { ascending: false });
      setRequests((data || []).map(r => ({ ...r, user_voted: r.user_id === user.id })));
    } else {
      toast.error("Failed to submit request");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="section-title mb-1">Faculty Requests</h1>
          <p className="text-sm text-gray-500">Upvote to prioritize, submit to request a new faculty</p>
        </div>
        {user ? (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 shrink-0 text-sm py-2">
            <Plus size={16} />
            Request
          </button>
        ) : (
          <Link href="/auth/login" className="btn-primary flex items-center gap-2 shrink-0 text-sm py-2">
            <Plus size={16} />
            Request
          </Link>
        )}
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {requests.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📬</p>
            <p className="font-semibold text-gray-700">No requests yet</p>
            <p className="text-sm text-gray-400 mt-1">Be the first to request a faculty!</p>
          </div>
        ) : (
          requests.map((req, i) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-4 flex items-start gap-4"
            >
              {/* Vote */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <button
                  onClick={() => handleVote(req.id, req.user_voted || false)}
                  className={cn(
                    "p-1.5 rounded-xl transition-all",
                    req.user_voted ? "bg-blush-500 text-white" : "bg-rose-50 text-blush-500 hover:bg-blush-100"
                  )}
                >
                  <ChevronUp size={16} />
                </button>
                <span className="text-sm font-bold text-gray-700">{req.upvotes}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 mb-0.5">{req.faculty_name}</h3>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {req.departments && (
                    <span className="badge bg-blush-50 text-blush-600 border border-blush-100">
                      {req.departments.icon} {req.departments.name}
                    </span>
                  )}
                  {req.subject && (
                    <span className="badge bg-gray-50 text-gray-500 border border-gray-100">
                      📚 {req.subject}
                    </span>
                  )}
                </div>
                {req.description && (
                  <p className="text-sm text-gray-500 mb-2">{req.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <Image
                    src={getAvatarUrl(req.profiles?.username || "anon")}
                    alt="requester"
                    width={18}
                    height={18}
                    className="rounded-full"
                  />
                  <span className="text-xs text-gray-400">
                    {req.profiles?.username || "Anonymous"} · {timeAgo(req.created_at)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* New Request Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-xl text-gray-800">Request Faculty</h3>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-rose-50 rounded-xl">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Faculty Name *</label>
                  <input
                    type="text"
                    value={facultyName}
                    onChange={e => setFacultyName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Kumar"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Department (optional)</label>
                  <select value={deptId} onChange={e => setDeptId(e.target.value)} className="input-field appearance-none">
                    <option value="">Select department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.icon} {d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Subject (optional)</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. Data Structures"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Additional Notes (optional)</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Any other details..."
                    className="input-field resize-none"
                    rows={3}
                  />
                </div>

                <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full disabled:opacity-60">
                  {loading ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
