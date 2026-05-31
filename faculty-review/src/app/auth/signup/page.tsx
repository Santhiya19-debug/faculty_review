"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import toast from "react-hot-toast";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Fill in all fields"); return; }
    if (password !== confirmPass) { toast.error("Passwords don't match"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }

    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) { toast.error(error.message); setLoading(false); }
    else {
      toast.success("Account created! A random username was generated for you 🎉");
      router.push("/");
      router.refresh();
    }
  };

  const sampleUsernames = ["deadline_Survivor", "ProxyDealer", "internalmarksvictim"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-petal to-blush-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Link href="/" className="flex items-center justify-center gap-1 mb-8">
          <span className="font-sans font-bold text-2xl text-gray-800">Faculty</span>
          <span className="font-display italic font-semibold text-2xl text-blush-500"> Review</span>
          <span className="text-blush-400 text-xs align-super">✦</span>
        </Link>

        <div className="card p-6 sm:p-8">
          <h1 className="font-display font-bold text-2xl text-gray-800 mb-1">Create account</h1>
          <p className="text-sm text-gray-500 mb-4">Join and start reviewing anonymously</p>

          {/* Username preview */}
          <div className="bg-rose-50 rounded-xl p-3 mb-5 border border-blush-100">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles size={13} className="text-blush-500" />
              <p className="text-xs font-semibold text-blush-600">You&apos;ll get a random username</p>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {sampleUsernames.map(u => (
                <span key={u} className="text-xs bg-white px-2 py-0.5 rounded-lg text-gray-500 border border-rose-100">{u}</span>
              ))}
            </div>
          </div>

          {/* Google — works for sign up too (creates account on first use) */}
          <GoogleAuthButton label="Sign up with Google" />

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-rose-100" />
            <span className="text-xs text-gray-400 font-medium">or sign up with email</span>
            <div className="flex-1 h-px bg-rose-100" />
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="input-field pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                placeholder="Confirm password"
                className="input-field"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Have an account?{" "}
            <Link href="/auth/login" className="text-blush-500 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Your real name is never shown publicly 🔒
        </p>
      </motion.div>
    </div>
  );
}
