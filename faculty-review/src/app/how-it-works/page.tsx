import MainLayout from "@/components/layout/MainLayout";
import Link from "next/link";

export const metadata = { title: "How It Works — Faculty Review" };

const steps = [
  {
    emoji: "🔍",
    step: "01",
    title: "Find your faculty",
    body: "Search by name or filter by department. Every faculty has a dedicated page with ratings across 6 categories — from teaching quality to how strict they are with attendance.",
  },
  {
    emoji: "⭐",
    step: "02",
    title: "Rate & review",
    body: "Sign up (takes 10 seconds), and drop your honest review. Rate each category on a scale of 1–10. Write as much or as little as you want — no minimum, no pressure.",
  },
  {
    emoji: "🕵️",
    step: "03",
    title: "Stay anonymous, always",
    body: "We auto-generate a random username for you — something like sleepy_penguin or chaoscoder. Your real name? Never shown. Not to other students, not to anyone.",
  },
  {
    emoji: "👍",
    step: "04",
    title: "Upvote helpful reviews",
    body: "See a review that genuinely helped you? Upvote it. The most helpful reviews float to the top so the good stuff is easy to find.",
  },
  {
    emoji: "📬",
    step: "05",
    title: "Request missing faculty",
    body: "Can't find a faculty? Submit a request with their name and department. The community can upvote it to show demand — the more votes, the faster they get added.",
  },
  {
    emoji: "💬",
    step: "06",
    title: "Discuss & comment",
    body: "Drop comments on faculty requests, ask questions, share quick opinions. The whole point is for students to help each other navigate college life better.",
  },
];

const faqs = [
  {
    q: "Is this actually anonymous?",
    a: "Yes, for real. Your email is stored securely but never displayed. All reviews show only your randomly generated username. Even we can't tell who wrote what review.",
  },
  {
    q: "Can faculty see who reviewed them?",
    a: "Nope. Faculty only see the same public reviews that everyone else sees — username and review content only. No email, no identity.",
  },
  {
    q: "What if someone posts something fake or abusive?",
    a: "Every review has a Report button. Our moderation team reviews flagged content and removes anything that violates our guidelines. Keep it honest and constructive.",
  },
  {
    q: "Can I edit or delete my review?",
    a: "Yes. Go to your profile, find the review, and hit edit or delete. You have full control over your own content.",
  },
  {
    q: "How are the ratings calculated?",
    a: "Each review rates 6 categories (strictness, internal marks, CAT correction, teaching quality, attendance flexibility, student friendliness). The overall rating is the average of all six.",
  },
];

export default function HowItWorksPage() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Hero */}
        <div className="text-center mb-12">
          <p className="text-blush-500 font-display italic font-semibold text-lg mb-2">No cap, it's easy.</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-gray-800 mb-4">
            How it works
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
            Faculty Review is built by students, for students. Here&apos;s exactly how everything works — from finding a faculty to dropping an anonymous review.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-14">
          {steps.map((s) => (
            <div key={s.step} className="card p-5 sm:p-6 flex gap-5 items-start">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-blush-50 rounded-2xl flex items-center justify-center text-2xl border border-blush-100">
                  {s.emoji}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-blush-400 font-mono">{s.step}</span>
                  <h3 className="font-semibold text-gray-800">{s.title}</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Voting explained */}
        <div className="bg-gradient-to-br from-blush-50 to-petal rounded-3xl p-6 sm:p-8 mb-14 border border-blush-100">
          <h2 className="font-display font-bold text-2xl text-gray-800 mb-3">The voting system 👍</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">
            Every review can be upvoted or downvoted based on how helpful it is. This isn&apos;t about whether you agree — it&apos;s about whether the review actually helped someone make a decision.
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">↑</span> Upvote = &quot;this was actually useful&quot;</li>
            <li className="flex items-start gap-2"><span className="text-rose-400 mt-0.5">↓</span> Downvote = &quot;not helpful / feels off&quot;</li>
            <li className="flex items-start gap-2"><span className="text-gray-400 mt-0.5">📊</span> Reviews with the most helpful votes show up first</li>
          </ul>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="font-display font-bold text-2xl text-gray-800 mb-6">FAQ</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="card p-5">
                <p className="font-semibold text-gray-800 text-sm mb-2">{faq.q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-500 mb-4">Ready to help your fellow students?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/search" className="btn-primary inline-flex justify-center">
              Browse Faculties →
            </Link>
            <Link href="/auth/signup" className="btn-secondary inline-flex justify-center">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
