"use client";

import { useCallback, useEffect, useState } from "react";
import { formatNPR } from "@cph/shared-types";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { apiFetch } from "@/lib/api";

interface CartItem {
  productId: string;
  name: string;
  unitPrice: number;
  qty: number;
}

interface AbandonedCart {
  id: string;
  customer: { name: string; email: string; phone: string | null } | null;
  items: CartItem[];
  subtotal: number;
  updatedAt: string;
}

function idleFor(updatedAt: string): string {
  const ms = Date.now() - new Date(updatedAt).getTime();
  const hours = Math.floor(ms / (60 * 60 * 1000));
  if (hours < 1) return "Under an hour ago";
  if (hours < 24) return `${hours}h idle`;
  return `${Math.floor(hours / 24)}d idle`;
}

export default function AdminAbandonedCartsPage() {
  const { accessToken } = useAdminAuth();
  const [carts, setCarts] = useState<AbandonedCart[] | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setCarts(await apiFetch<AbandonedCart[]>("/admin/carts", { accessToken }));
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h1 className="mb-2 text-[22px]">Abandoned Carts</h1>
      <p className="mb-6 text-[13px] text-text-secondary">
        Non-empty carts that haven&apos;t converted to an order yet — signed-in customers and anonymous browsers alike.
      </p>

      {!carts ? (
        <p className="text-[13px] text-text-muted">Loading…</p>
      ) : carts.length === 0 ? (
        <p className="text-[13px] text-text-muted">No abandoned carts right now.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {carts.map((cart) => (
            <div key={cart.id} className="rounded-card border border-border bg-white p-5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[14px] font-semibold text-text-dark">
                  {cart.customer ? cart.customer.name : "Guest (not signed in)"}
                </span>
                <span className="text-[12px] text-text-muted">{idleFor(cart.updatedAt)}</span>
              </div>
              {cart.customer && (
                <p className="mb-2 text-[12px] text-text-secondary">
                  {cart.customer.email}
                  {cart.customer.phone ? ` · ${cart.customer.phone}` : ""}
                </p>
              )}
              <div className="mb-2 flex flex-col gap-1 border-t border-border pt-2">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-[13px] text-text-secondary">
                    <span>{item.name} &times; {item.qty}</span>
                    <span>{formatNPR(item.unitPrice * item.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[13px] font-semibold text-text-dark">
                <span>Subtotal</span>
                <span>{formatNPR(cart.subtotal)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
