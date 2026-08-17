"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "./AuthContext";

interface WishlistContextValue {
  ids: Set<string>;
  isWishlisted: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, accessToken } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [ids, setIds] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    if (!accessToken) {
      setIds(new Set());
      return;
    }
    const items = await apiFetch<{ id: string }[]>("/wishlist", { accessToken }).catch(() => []);
    setIds(new Set(items.map((i) => i.id)));
  }, [accessToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = useCallback(
    async (productId: string) => {
      if (!user) {
        router.push(`/account/signin?next=${encodeURIComponent(pathname)}`);
        return;
      }
      const wishlisted = ids.has(productId);
      setIds((prev) => {
        const next = new Set(prev);
        if (wishlisted) next.delete(productId);
        else next.add(productId);
        return next;
      });
      try {
        if (wishlisted) {
          await apiFetch(`/wishlist/${productId}`, { method: "DELETE", accessToken });
        } else {
          await apiFetch(`/wishlist/${productId}`, { method: "POST", accessToken });
        }
      } catch {
        await refresh(); // revert to server truth on failure
      }
    },
    [ids, user, accessToken, router, pathname, refresh],
  );

  const isWishlisted = useCallback((productId: string) => ids.has(productId), [ids]);

  return <WishlistContext.Provider value={{ ids, isWishlisted, toggle }}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
