"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Faculty } from "@/types";
import FacultyCard from "@/components/faculty/FacultyCard";

interface TopFacultiesProps {
  faculties: Faculty[];
}

export default function TopFaculties({ faculties }: TopFacultiesProps) {
  return (
    <section className="py-10 sm:py-14 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="section-title"
          >
            Top Rated Faculties
          </motion.h2>
          <Link href="/search" className="flex items-center gap-1 text-sm font-semibold text-blush-500 hover:text-blush-600 transition-colors">
            View All <ArrowRight size={15} />
          </Link>
        </div>

        {faculties.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🎓</p>
            <p className="font-medium">No faculty data yet.</p>
            <p className="text-sm mt-1">Be the first to add a review!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {faculties.map((faculty, i) => (
              <FacultyCard key={faculty.id} faculty={faculty} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
