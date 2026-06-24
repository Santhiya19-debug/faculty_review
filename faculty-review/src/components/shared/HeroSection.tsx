"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ChevronDown } from "lucide-react";
import { School } from "@/types";

interface HeroSectionProps {
  schools: School[];
}

export default function HeroSection({ schools }: HeroSectionProps) {
  const [query, setQuery] = useState("");
  const [school, setSchool] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-petal to-blush-50 min-h-[85vh] sm:min-h-[75vh] flex items-center">
      {/* Decorative blobs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-blush-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-100/30 rounded-full blur-3xl pointer-events-none" />

      {/* Floating stars */}
      <div className="absolute top-24 right-1/4 text-blush-300 text-xl animate-float hidden lg:block">
        ✦
      </div>
      <div
        className="absolute top-40 right-16 text-blush-200 text-sm animate-float hidden lg:block"
        style={{ animationDelay: "1s" }}
      >
        ✦
      </div>
      <div
        className="absolute bottom-32 left-1/4 text-blush-200 text-xs animate-float hidden lg:block"
        style={{ animationDelay: "2s" }}
      >
        ✦
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <p className="text-blush-500 font-semibold text-sm tracking-wide mb-3 font-display italic">
                Find,
              </p>

              {/* LCP text — DO NOT ANIMATE */}
              <h1 className="font-display font-bold text-4xl sm:text-5xl text-gray-800 leading-tight mb-1">
                Review.
              </h1>

              <h1 className="font-display font-bold text-4xl sm:text-5xl text-gray-800 leading-tight">
                Improve{" "}
                <span className="font-display italic text-blush-500">
                  Together.
                </span>
              </h1>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-gray-500 text-base mb-8 max-w-md leading-relaxed"
            >
              Share honest feedback about your faculty and help build a better
              learning experience for everyone.
            </motion.p>

            {/* Search bar */}
            <motion.form
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-3 mb-4"
            >
              <div className="flex-1 relative">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-blush-400"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search faculty name..."
                  className="input-field pl-10"
                />
              </div>

              <div className="relative sm:w-44">
                <select
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="input-field appearance-none pr-8 text-sm"
                >
                  <option value="">All Schools</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name.match(/\(([^)]+)\)/)?.[1] || s.name}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blush-400 pointer-events-none"
                />
              </div>

              <button type="submit" className="btn-primary whitespace-nowrap">
                Search
              </button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              <button
                onClick={() => router.push("/search")}
                className="btn-primary"
              >
                Get Started →
              </button>
            </motion.div>
          </motion.div>

          {/* Right Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="hidden lg:flex justify-center"
          >
            <div className="relative animate-float">
              <div className="w-56 h-72 bg-white rounded-3xl shadow-card-hover border-2 border-blush-100 p-5 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-5 bg-blush-400 rounded-lg" />

                <h3 className="font-display font-bold text-gray-700 text-center mb-4 mt-2 text-sm">
                  FACULTY REVIEW
                </h3>

                {[5, 4, 5, 3, 4].map((stars, i) => (
                  <div key={i} className="flex gap-1 mb-2.5 justify-center">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <span
                        key={j}
                        className={
                          j < stars ? "text-blush-400" : "text-rose-100"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                ))}

                <div className="absolute -bottom-4 -right-4 w-10 h-32 bg-blush-400 rounded-full rotate-12 flex items-end justify-center pb-2">
                  <div className="w-3 h-4 bg-yellow-200 rounded-sm" />
                </div>
              </div>

              <div className="absolute -top-6 -left-8 bg-white rounded-2xl shadow-card px-3 py-1.5 text-xs font-medium text-gray-600 border border-rose-100">
                ⭐ Great teacher!
              </div>

              <div className="absolute -bottom-2 -left-10 bg-blush-500 rounded-2xl px-3 py-1.5 text-xs font-medium text-white shadow-pink">
                Very helpful 👍
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}