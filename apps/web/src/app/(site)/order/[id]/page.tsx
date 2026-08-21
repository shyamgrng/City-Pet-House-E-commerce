"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useOrder } from "@/context/OrderContext";
import { formatRs } from "@/lib/catalog-types";
import { orderTimeline, STATUS_COLORS } from "@/lib/order-types";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, ready } = useAuth();
  const { orders, submitReview } = useOrder();
  const order = orders.find((o) => o.id === id);

  if (!ready) return null;

  if (!order || !user || order.ownerId !== user.id) {
    return (
      <div className="px-8 py-10 text-center text-sm text-[#8A96A3]">
        Order not found.{" "}
        <Link href="/account" className="text-primary font-semibold">
          Back to My Account
        </Link>
      </div>
    );
  }

  const timeline = orderTimeline(order);
  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="px-8 py-7 max-w-[560px] mx-auto">
      <Link href="/account" className="text-[13px] text-primary font-semibold mb-4 inline-block">
        ← Back to My Orders
      </Link>

      <div className="text-[15px] font-bold text-[#1A2027] mb-1">{order.id}</div>
      <div className="text-xs text-[#8A96A3] mb-5">
        {fmtDate(order.createdAt)} · {formatRs(order.total)}
      </div>

      {order.status === "Payment Rejected" && (
        <div className="bg-[#FBE9E9] border border-[#F3C9C9] rounded-xl p-4 mb-5">
          <div className="text-xs font-bold text-[#D64545]">Payment Rejected</div>
          <div className="text-xs text-[#5B6773] mt-1">{order.rejectReason}</div>
        </div>
      )}

      <div className="mb-6">
        {timeline
          .filter((s) => s.key !== "review" || order.status === "Delivered")
          .map((step, i, arr) => (
            <div key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] shrink-0"
                  style={{ background: step.done ? "#1F7A4D" : "#D8DEE2", color: "#fff" }}
                >
                  {step.icon}
                </div>
                {i < arr.length - 1 && <div className="w-0.5 flex-1 my-0.5" style={{ background: step.done ? "#1F7A4D" : "#D8DEE2" }} />}
              </div>
              <div className="pb-5 flex-1 min-w-0">
                <div className="text-[13px] font-bold" style={{ color: step.done ? "#1A2027" : "#8A96A3" }}>
                  {step.title}
                </div>
                <div className="text-xs text-[#8A96A3] mt-0.5">{step.subtitle}</div>

                {step.key === "placed" && (
                  <div className="bg-[#F7F9FA] border border-[#E4E9EC] rounded-lg px-3.5 py-3 mt-2.5">
                    <div className="text-[11px] font-bold text-[#8A96A3] uppercase mb-2">Invoice</div>
                    {order.items.map((it) => (
                      <div key={it.productId} className="flex justify-between text-xs py-0.5">
                        <span className="text-[#3A4652]">
                          {it.name} × {it.qty}
                        </span>
                        <span className="font-semibold text-[#1A2027]">{formatRs(it.price * it.qty)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs py-0.5 text-[#8A96A3]">
                      <span>Delivery Fee</span>
                      <span>{formatRs(order.deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1.5 mt-1 border-t border-[#E4E9EC] font-bold text-[#1A2027]">
                      <span>Total</span>
                      <span>{formatRs(order.total)}</span>
                    </div>
                  </div>
                )}

                {step.key === "receipt" && (
                  <div className="bg-[#F7F9FA] border border-[#E4E9EC] rounded-lg px-3.5 py-3 mt-2.5 text-xs text-[#3A4652]">
                    📎 Payment receipt uploaded — held for admin review, usually within a few hours
                  </div>
                )}

                {step.key === "review" && order.status === "Delivered" && (
                  <ReviewBlock orderId={order.id} items={order.items} reviews={order.reviews} onSubmit={submitReview} />
                )}
              </div>
            </div>
          ))}
      </div>

      <div className="border border-[#E4E9EC] rounded-xl p-4">
        <div className="text-[13px] font-bold text-[#1A2027] mb-2">Receiver Details</div>
        <div className="text-xs text-[#5B6773]">{order.ownerName}</div>
        <div className="text-xs text-[#5B6773] mt-0.5">📞 {order.ownerPhone}</div>
        <div className="text-xs text-[#5B6773] mt-0.5">📍 {order.address}</div>
        <div className="text-[11px] font-bold mt-2.5" style={{ color: STATUS_COLORS[order.status] }}>
          Status: {order.status}
        </div>
      </div>
    </div>
  );
}

function ReviewBlock({
  orderId,
  items,
  reviews,
  onSubmit,
}: {
  orderId: string;
  items: { productId: string; name: string }[];
  reviews?: Record<string, { rating: number; comment: string }>;
  onSubmit: (orderId: string, productId: string, rating: number, comment: string) => void;
}) {
  return (
    <div className="mt-2.5 flex flex-col gap-3">
      {items.map((it) => (
        <ProductReview key={it.productId} orderId={orderId} productId={it.productId} name={it.name} existing={reviews?.[it.productId]} onSubmit={onSubmit} />
      ))}
    </div>
  );
}

function ProductReview({
  orderId,
  productId,
  name,
  existing,
  onSubmit,
}: {
  orderId: string;
  productId: string;
  name: string;
  existing?: { rating: number; comment: string };
  onSubmit: (orderId: string, productId: string, rating: number, comment: string) => void;
}) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [submitted, setSubmitted] = useState(!!existing);

  if (submitted) {
    return (
      <div className="bg-[#EAF6EE] border border-[#CFE9D8] rounded-lg px-3.5 py-3 text-xs text-[#1F7A4D]">
        ✓ Thanks — your review for {name} has been submitted.
      </div>
    );
  }

  return (
    <div className="border border-[#E4E9EC] rounded-lg px-3.5 py-3">
      <div className="text-xs font-semibold text-[#1A2027] mb-1.5">{name}</div>
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} onClick={() => setRating(n)} className="text-lg cursor-pointer" style={{ color: n <= rating ? "#FFC940" : "#D8DEE2" }}>
            ★
          </span>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience…"
        rows={2}
        className="w-full px-2.5 py-2 rounded-md border border-[#E4E9EC] text-xs mb-2 box-border resize-none"
      />
      <button
        onClick={() => {
          if (rating === 0) return;
          onSubmit(orderId, productId, rating, comment.trim());
          setSubmitted(true);
        }}
        disabled={rating === 0}
        className="bg-primary text-white px-3.5 py-1.5 rounded-md text-[11px] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Submit Review
      </button>
    </div>
  );
}
