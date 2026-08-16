"use client";

import { ReactNode } from "react";
import { formatNPR } from "@cph/shared-types";
import { resolveUploadUrl } from "@/lib/api";
import { AdminOrder } from "@/lib/admin-types";

export function AdminOrderCard({
  order,
  showReceipt = false,
  showChecklist,
  children,
}: {
  order: AdminOrder;
  showReceipt?: boolean;
  showChecklist?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-card border border-border bg-white p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[14px] font-semibold text-text-dark">{order.id}</p>
          <p className="text-[12px] text-text-muted">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-[13px] font-medium text-text-dark">{order.buyer.name}</p>
          <p className="text-[12px] text-text-muted">{order.addressSnapshot.phone}</p>
        </div>
      </div>

      <p className="mb-3 text-[12px] text-text-secondary">{order.addressSnapshot.address}</p>

      <div className="mb-3 flex flex-col gap-1 border-t border-border pt-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-[13px] text-text-secondary">
            <span>
              {item.nameSnapshot} &times; {item.qty}
              {item.outOfStock && <span className="ml-2 text-[11px] font-medium text-error">Out of stock</span>}
            </span>
            <span>{formatNPR(item.priceSnapshot * item.qty)}</span>
          </div>
        ))}
        <div className="mt-1 flex justify-between text-[13px] font-semibold text-text-dark">
          <span>Total ({order.paymentMethod})</span>
          <span>{formatNPR(order.amount + order.deliveryFee)}</span>
        </div>
      </div>

      {showReceipt && (
        <a
          href={resolveUploadUrl(order.paymentReceiptUrl)}
          target="_blank"
          rel="noreferrer"
          className="mb-3 inline-block text-[12px] font-medium text-primary hover:underline"
        >
          View payment receipt →
        </a>
      )}

      {showChecklist}

      {order.cancellationReason && (
        <p className="mb-3 text-[12px] text-error">Cancelled: {order.cancellationReason}</p>
      )}

      {children && <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">{children}</div>}
    </div>
  );
}
