"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Menu, X, ChevronDown, User, LogOut, Star, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Avatar from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Faculties", href: "/search" },
  { label: "Departments", href: "/search?view=departments" },
  { label: "Requests", href: "/requests" },
  { label: "About Us", href: "/about" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-white/95 backdrop-blur-md shadow-soft border-b border-rose-100" : "bg-white/80 backdrop-blur-sm"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 shrink-0">
          <span className="font-sans font-bold text-xl text-gray-800">Faculty</span>
          <span className="font-display italic font-semibold text-xl text-blush-500"> Review</span>
          <span className="text-blush-400 text-xs align-super">✦</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-blush-500",
                pathname === link.href ? "text-blush-500" : "text-gray-600"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Link href="/search" className="p-2 text-gray-500 hover:text-blush-500 transition-colors">
            <Search size={18} />
          </Link>

          {user ? (
            <>
              <button className="p-2 text-gray-500 hover:text-blush-500 transition-colors relative hidden sm:flex">
                <Bell size={18} />
              </button>
              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-rose-50 transition-colors"
                >
                  <Avatar username={profile?.username || "user"} size="sm" />
                  <ChevronDown size={14} className="text-gray-500 hidden sm:block" />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-card-hover border border-rose-100 py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-rose-50">
                        <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-700 truncate">{profile?.username}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-rose-50 hover:text-blush-600 transition-colors"
                      >
                        <User size={15} />
                        My Profile
                      </Link>
                      <Link
                        href="/profile?tab=reviews"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-rose-50 hover:text-blush-600 transition-colors"
                      >
                        <Star size={15} />
                        My Reviews
                      </Link>
                      <Link
                        href="/profile?tab=requests"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-rose-50 hover:text-blush-600 transition-colors"
                      >
                        <FileText size={15} />
                        My Requests
                      </Link>
                      <div className="border-t border-rose-50 mt-1 pt-1">
                        <button
                          onClick={async () => { await signOut(); setProfileOpen(false); window.location.href = "/"; }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors"
                        >
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="hidden sm:block text-sm font-medium text-gray-600 hover:text-blush-500 transition-colors px-3 py-2">
                Log In
              </Link>
              <Link href="/auth/signup" className="btn-primary text-sm py-2 px-4">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-blush-500 transition-colors"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-rose-100 overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "py-2.5 px-3 rounded-xl text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-blush-50 text-blush-600"
                      : "text-gray-600 hover:bg-rose-50"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="py-2.5 px-3 text-sm font-medium text-gray-600">
                  Log In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
