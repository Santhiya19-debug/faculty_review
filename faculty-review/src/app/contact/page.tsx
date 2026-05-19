"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { Send, MessageSquare, Flag, HelpCircle } from "lucide-react";

const reasons = [
  { value: "fake_review", label: "Fake or misleading review" },
  { value: "abusive", label: "Abusive / offensive content" },
  { value: "personal_attack", label: "Personal attack on faculty" },
  { value: "spam", label: "Spam or duplicate content" },
  { value: "feedback", label: "General feedback / suggestion" },
  { value: "bug", label: "Bug report" },
  { value: "other", label: "Other" },
];

export default function ContactPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) { toast.error("Please select a reason"); return; }
    if (!message.trim()) { toast.error("Please describe the issue"); return; }

    setLoading(true);
    try {
      // Store as a report in the reports table
      const { error } = await supabase.from("reports").insert({
        reporter_id: user?.id || null,
        reason,
        description: `${email ? `Contact: ${email}\n\n` : ""}${message.trim()}`,
      });

      if (error) throw error;
      setSubmitted(true);
      toast.success("Message sent! We'll look into it.");
    } catch {
      toast.error("Failed to send. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display font-bold text-4xl text-gray-800 mb-3">Contact Us</h1>
          <p className="text-gray-500">Report content, send feedback, or ask anything. We actually read these.</p>
        </div>

        {/* Info cards */}
        <div className="grid sm:grid-cols-3 gap-3 mb-8">
          {[
            { icon: Flag, label: "Report abuse", desc: "Flag reviews that break guidelines" },
            { icon: MessageSquare, label: "Feedback", desc: "Suggestions to improve the platform" },
            { icon: HelpCircle, label: "Help", desc: "Questions about how things work" },
          ].map((item) => (
            <div key={item.label} className="card p-4 text-center">
              <div className="w-10 h-10 bg-blush-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <item.icon size={18} className="text-blush-500" />
              </div>
              <p className="font-semibold text-sm text-gray-700 mb-0.5">{item.label}</p>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        {submitted ? (
          <div className="card p-10 text-center">
            <p className="text-5xl mb-4">✅</p>
            <h3 className="font-display font-bold text-xl text-gray-800 mb-2">Got it, thanks!</h3>
            <p className="text-sm text-gray-500 mb-4">Your message has been received. We&apos;ll review it and take action if needed.</p>
            <button onClick={() => { setSubmitted(false); setReason(""); setMessage(""); setEmail(""); }} className="btn-secondary text-sm py-2">
              Send another message
            </button>
          </div>
        ) : (
          <div className="card p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  What&apos;s this about? *
                </label>
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="input-field appearance-none"
                  required
                >
                  <option value="">Select a reason...</option>
                  {reasons.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {!user && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Your email (optional — for follow-up)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="input-field"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Message *
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe the issue or share your feedback..."
                  className="input-field resize-none"
                  rows={5}
                  required
                  maxLength={2000}
                />
                <p className="text-right text-xs text-gray-300 mt-1">{message.length}/2000</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Send size={15} />
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
