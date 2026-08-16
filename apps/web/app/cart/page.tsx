"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatNPR } from "@cph/shared-types";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function CartPage() {
  const cart = useCart();
  const { user } = useAuth();
  const router = useRouter();

  function goToCheckout() {
    if (!user) {
      router.push("/account/signin?next=/checkout");
      return;
    }
    router.push("/checkout");
  }

  if (cart.loading) {
    return <p className="mx-auto max-w-4xl px-6 py-16 text-center text-[13px] text-text-muted">Loading cart…</p>;
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h1 className="mb-3 text-[20px]">Your cart is empty</h1>
        <Link href="/shop" className="text-[13px] font-semibold text-primary hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-6 text-[22px]">Your Cart</h1>

      <div className="flex flex-col gap-3">
        {cart.items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 rounded-card border border-border bg-white p-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-control bg-bg-surface">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.name} className="h-full w-full rounded-control object-cover" />
              ) : (
                <span className="text-[10px] text-text-muted">No photo</span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-medium text-text-dark">{item.name}</p>
              <p className="text-[12px] text-text-muted">{formatNPR(item.unitPrice)} each</p>
              {item.outOfStock && <p className="text-[12px] font-medium text-error">Currently out of stock</p>}
            </div>
            <input
              type="number"
              min={1}
              value={item.qty}
              onChange={(e) => cart.updateItem(item.productId, Math.max(1, Number(e.target.value)))}
              className="w-16 rounded-control border border-border px-2 py-1.5 text-center text-[13px]"
            />
            <span className="w-24 text-right font-heading text-[14px] font-semibold text-text-dark">
              {formatNPR(item.unitPrice * item.qty)}
            </span>
            <button
              onClick={() => cart.removeItem(item.productId)}
              className="text-[12px] font-medium text-error hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-end gap-1 border-t border-border pt-4">
        <div className="flex w-64 justify-between text-[13px] text-text-secondary">
          <span>Subtotal</span>
          <span>{formatNPR(cart.subtotal)}</span>
        </div>
        <div className="flex w-64 justify-between text-[13px] text-text-secondary">
          <span>Delivery fee</span>
          <span>{formatNPR(cart.deliveryFee)}</span>
        </div>
        <div className="flex w-64 justify-between font-heading text-[16px] font-bold text-text-dark">
          <span>Total</span>
          <span>{formatNPR(cart.total)}</span>
        </div>
        <button
          onClick={goToCheckout}
          className="mt-4 w-64 rounded-control bg-primary px-5 py-2.5 text-[13px] font-semibold text-white hover:opacity-90"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
