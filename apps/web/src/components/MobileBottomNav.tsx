"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

const TABS = [
  { label: "Home", href: "/", icon: "🏠" },
  { label: "Shop", href: "/shop", icon: "🛍️" },
  { label: "Pets", href: "/pets", icon: "🐾" },
  { label: "Web Vet", href: "/vet", icon: "🩺" },
  { label: "Cart", href: "/cart", icon: "🛒" },
] as const;

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { count } = useCart();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#E4E9EC] flex items-stretch pb-[env(safe-area-inset-bottom)]">
      {TABS.map((t) => {
        const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative">
            <span className="text-lg" style={{ opacity: active ? 1 : 0.55 }}>
              {t.icon}
            </span>
            <span className={`text-[10px] font-semibold ${active ? "text-primary" : "text-[#8A96A3]"}`}>{t.label}</span>
            {t.href === "/cart" && count > 0 && (
              <span className="absolute top-1 right-[calc(50%-18px)] min-w-[15px] h-[15px] px-1 rounded-full bg-[#D64545] text-white text-[9px] font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
