"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";

export default function RequestCTA() {
  return (
    <section className="py-10 sm:py-14 bg-gradient-to-r from-blush-50 to-petal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden bg-white rounded-3xl shadow-card p-8 sm:p-12 flex flex-col sm:flex-row items-center gap-8">
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-blush-50 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-50 rounded-full translate-y-1/2 -translate-x-1/2" />

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 relative z-10"
          >
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-gray-800 mb-3">
              Can&apos;t find the faculty you&apos;re looking for?
            </h2>
            <p className="text-gray-500 text-sm sm:text-base mb-6 max-w-md">
              Submit a request and we&apos;ll notify you once it&apos;s available for review.
            </p>
            <Link href="/requests" className="btn-primary inline-flex items-center gap-2">
              Request Faculty →
            </Link>
          </motion.div>

          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative z-10 hidden sm:block"
          >
            <div className="w-32 h-24 bg-blush-400 rounded-2xl flex items-center justify-center shadow-pink animate-float">
              <Mail size={40} className="text-white" />
            </div>
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-blush-200 rounded-full flex items-center justify-center">
              <ArrowRight size={16} className="text-blush-500 -rotate-45" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
