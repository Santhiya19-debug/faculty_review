import Link from "next/link";
import { Instagram, Twitter, Youtube, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-rose-100 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-1 mb-3">
              <span className="font-sans font-bold text-xl text-gray-800">Faculty</span>
              <span className="font-display italic font-semibold text-xl text-blush-500"> Review</span>
              <span className="text-blush-400 text-xs align-super">✦</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-4 max-w-xs">
              A platform by students, for students. Share feedback, read reviews, improve education together.
            </p>
            <div className="flex items-center gap-3">
              {[Instagram, Twitter, Youtube, Send].map((Icon, i) => (
                <a key={i} href="#" className="p-2 bg-rose-50 hover:bg-blush-100 rounded-xl text-blush-500 transition-colors">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: "Home", href: "/" },
                { label: "Browse Faculties", href: "/search" },
                { label: "Departments", href: "/search?view=departments" },
                { label: "Reviews", href: "/search" },
                { label: "Requests", href: "/requests" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-gray-500 hover:text-blush-500 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Resources</h4>
            <ul className="space-y-2">
              {[
                { label: "How It Works", href: "/how-it-works" },
                { label: "Review Guidelines", href: "/review-guidelines" },
                { label: "FAQ", href: "/how-it-works" },
                { label: "Contact Us", href: "/contact" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-gray-500 hover:text-blush-500 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Newsletter</h4>
            <p className="text-xs text-gray-500 mb-3">Stay updated with the latest reviews and news.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 text-xs border border-rose-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blush-200 bg-rose-50"
              />
              <button className="p-2.5 bg-blush-500 hover:bg-blush-600 text-white rounded-xl transition-colors">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-rose-100 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-400">© 2024 Faculty Review. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-xs text-gray-400 hover:text-blush-500 transition-colors">Terms of Use</Link>
            <Link href="#" className="text-xs text-gray-400 hover:text-blush-500 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
