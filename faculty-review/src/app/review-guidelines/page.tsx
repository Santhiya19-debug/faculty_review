import MainLayout from "@/components/layout/MainLayout";
import Link from "next/link";

export const metadata = { title: "Review Guidelines — Faculty Review" };

const dos = [
  { emoji: "✅", title: "Be honest", body: "Write what you actually experienced. Good, bad, mid — all of it is valid as long as it's real." },
  { emoji: "✅", title: "Be specific", body: "\"Corrects fairly and gives partial marks\" is way more useful than \"nice person\". Specific details help people make real decisions." },
  { emoji: "✅", title: "Be constructive", body: "If a teaching style didn't work for you, say why. Your experience could genuinely help someone else navigate their semester better." },
  { emoji: "✅", title: "Talk about the academic experience", body: "Teaching quality, correction style, attendance, internal marks — this is what people actually need to know." },
  { emoji: "✅", title: "Update your review", body: "Had them for another semester and things changed? Edit your review. Accuracy over time matters." },
];

const donts = [
  { emoji: "❌", title: "No personal attacks", body: "Criticise the teaching style, not the person. There's a difference between \"very strict correction\" and making it personal. Keep it academic." },
  { emoji: "❌", title: "No fake or exaggerated reviews", body: "Don't post a review based on something you heard. Only review faculty you've actually had. Fake reviews mess up the whole platform for everyone." },
  { emoji: "❌", title: "No abusive or offensive language", body: "Slurs, hate speech, explicit language — none of it. Ever. This is a zero tolerance thing." },
  { emoji: "❌", title: "No personal information", body: "Don't mention anyone's personal details — not the faculty's, not yours, not another student's. Keep it about the academic experience only." },
  { emoji: "❌", title: "No spam or repeated submissions", body: "One review per faculty per account. If you had them multiple times, update your existing review — don't create duplicates." },
];

export default function ReviewGuidelinesPage() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Hero */}
        <div className="text-center mb-12">
          <p className="text-blush-500 font-display italic font-semibold text-lg mb-2">Keep it real, keep it respectful.</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-gray-800 mb-4">
            Review Guidelines
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
            Faculty Review only works if people are honest and respectful. These guidelines keep the platform useful for every student who reads it.
          </p>
        </div>

        {/* The idea */}
        <div className="bg-blush-50 border border-blush-100 rounded-3xl p-6 mb-10">
          <h2 className="font-semibold text-gray-800 mb-2">The whole idea 💡</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            A bad review that&apos;s honest is infinitely more useful than a fake positive one. We want this to be a place where students can make informed decisions — not a place where people vent personal grievances or post reviews to settle scores. Honest + respectful = actually helpful.
          </p>
        </div>

        {/* Do's */}
        <div className="mb-10">
          <h2 className="font-display font-bold text-2xl text-gray-800 mb-5">What to do ✅</h2>
          <div className="space-y-3">
            {dos.map((item) => (
              <div key={item.title} className="card p-5 flex gap-4 items-start">
                <span className="text-xl shrink-0">{item.emoji}</span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm mb-1">{item.title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Don'ts */}
        <div className="mb-10">
          <h2 className="font-display font-bold text-2xl text-gray-800 mb-5">What not to do ❌</h2>
          <div className="space-y-3">
            {donts.map((item) => (
              <div key={item.title} className="card p-5 flex gap-4 items-start border-rose-100">
                <span className="text-xl shrink-0">{item.emoji}</span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm mb-1">{item.title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enforcement */}
        <div className="card p-6 mb-10 border-rose-100">
          <h2 className="font-semibold text-gray-800 mb-3">⚠️ What happens if you break the rules</h2>
          <div className="space-y-2 text-sm text-gray-500">
            <p>Reviews that violate these guidelines will be <span className="font-medium text-gray-700">removed</span> after being reported and reviewed.</p>
            <p>Repeated violations can result in your account being <span className="font-medium text-gray-700">restricted</span>.</p>
            <p>If you see a review that doesn&apos;t belong here, hit the <span className="font-medium text-gray-700">Report</span> button — we actually check those.</p>
          </div>
        </div>

        {/* Report */}
        <div className="bg-gradient-to-br from-blush-50 to-petal rounded-3xl p-6 text-center border border-blush-100">
          <p className="text-2xl mb-3">🚩</p>
          <h3 className="font-semibold text-gray-800 mb-2">See something wrong?</h3>
          <p className="text-sm text-gray-500 mb-4">Use the Report button on any review, or reach us directly through the contact page.</p>
          <Link href="/contact" className="btn-primary inline-flex text-sm py-2">
            Contact Us
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
