import Link from "next/link";

export default function OrderPlacedPage({ searchParams }: { searchParams: { orderId?: string } }) {
  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-[28px] text-success">
        ✓
      </div>
      <h1 className="mb-2 text-[22px]">Order Placed</h1>
      <p className="mb-1 text-[13px] text-text-secondary">
        Order <span className="font-semibold text-text-dark">{searchParams.orderId}</span> is in our payment review
        queue. We&apos;ll confirm once your receipt is approved.
      </p>
      <p className="mb-8 text-[13px] text-text-secondary">
        Track its progress any time from your account.
      </p>
      <div className="flex justify-center gap-3">
        <Link href="/account/orders" className="rounded-control bg-primary px-5 py-2.5 text-[13px] font-semibold text-white">
          View My Orders
        </Link>
        <Link href="/shop" className="rounded-control border border-border px-5 py-2.5 text-[13px] font-semibold text-text-secondary">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
