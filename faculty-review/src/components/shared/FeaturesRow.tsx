"use client";

import { motion } from "framer-motion";
import { UserSearch, Star, PenLine, MessageSquarePlus } from "lucide-react";

const features = [
  { icon: UserSearch, color: "bg-rose-50 text-blush-500", title: "Find Faculties", desc: "Search and discover faculties across all departments" },
  { icon: Star, color: "bg-amber-50 text-amber-500", title: "Read Reviews", desc: "Read honest reviews from real students" },
  { icon: PenLine, color: "bg-violet-50 text-violet-500", title: "Write Reviews", desc: "Share your experience and help others decide" },
  { icon: MessageSquarePlus, color: "bg-emerald-50 text-emerald-500", title: "Request Faculty", desc: "Can't find a faculty? Request them now!" },
];

export default function FeaturesRow() {
  return (
    <section className="py-10 sm:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="flex flex-col items-center text-center p-4 sm:p-5 rounded-2xl hover:bg-rose-50/50 transition-colors group"
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-3 ${f.color} group-hover:scale-110 transition-transform`}>
                <f.icon size={22} />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1">{f.title}</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed hidden sm:block">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
