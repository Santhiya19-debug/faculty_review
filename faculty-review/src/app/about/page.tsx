import MainLayout from "@/components/layout/MainLayout";
import Link from "next/link";

export const metadata = { title: "About — Faculty Review" };

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="text-center mb-10">
          <h1 className="font-display font-bold text-4xl text-gray-800 mb-3">
            About <span className="text-blush-500 italic">Faculty Review</span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            A student-first platform built to bring transparency and honesty to the classroom experience.
          </p>
        </div>

        <div className="space-y-6">
          {[
            {
              emoji: "🎯",
              title: "Our Mission",
              content: "We believe students deserve honest, unfiltered information about their faculty to make better academic decisions. Faculty Review creates a safe, anonymous space for students to share genuine experiences.",
            },
            {
              emoji: "🔒",
              title: "Privacy First",
              content: "Your real name is never shown. We auto-generate fun, anonymous usernames so you can share freely without fear. Your email is stored securely and never displayed publicly.",
            },
            {
              emoji: "⭐",
              title: "Honest Reviews",
              content: "Rate faculty across 6 key categories — from teaching quality to attendance flexibility. Our community upvote system surfaces the most helpful reviews to the top.",
            },
            {
              emoji: "📬",
              title: "Request System",
              content: "Can't find a faculty? Request them! The community can upvote requests to show demand. Once enough interest is gathered, the faculty gets added to the platform.",
            },
          ].map((section) => (
            <div key={section.title} className="card p-6">
              <div className="flex items-start gap-4">
                <span className="text-3xl">{section.emoji}</span>
                <div>
                  <h2 className="font-semibold text-lg text-gray-800 mb-2">{section.title}</h2>
                  <p className="text-gray-500 text-sm leading-relaxed">{section.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/search" className="btn-primary inline-flex">
            Start Exploring →
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
