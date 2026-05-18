"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, User, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/requests", icon: PlusCircle, label: "Request" },
  { href: "/profile", icon: User, label: "Profile" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const isAuth = pathname.startsWith("/auth");
  if (isAuth) return null;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-rose-100 px-2 py-2 safe-area-pb">
      <div className="flex items-center justify-around">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all",
                active ? "text-blush-500" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
              {active && (
                <span className="absolute bottom-1 w-1 h-1 bg-blush-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
