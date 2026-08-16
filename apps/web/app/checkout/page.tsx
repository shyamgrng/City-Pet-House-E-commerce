"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatNPR } from "@cph/shared-types";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { apiFetch, uploadFile, ApiError } from "@/lib/api";

interface Address {
  id: string;
  label: string;
  address: string;
  phone: string;
  isPrimary: boolean;
}

export default function CheckoutPage() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const cart = useCart();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"FONEPAY" | "BANK_TRANSFER">("FONEPAY");
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/account/signin?next=/checkout");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!accessToken) return;
    apiFetch<Address[]>("/addresses", { accessToken }).then((list) => {
      setAddresses(list);
      const primary = list.find((a) => a.isPrimary) ?? list[0];
      if (primary) setAddressId(primary.id);
    });
  }, [accessToken]);

  async function handleReceiptChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { url } = await uploadFile(file);
      setReceiptUrl(url);
    } catch {
      setError("Could not upload the receipt — please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function placeOrder() {
    if (!addressId) {
      setError("Select a delivery address.");
      return;
    }
    if (!receiptUrl) {
      setError("Upload your payment receipt to continue.");
      return;
    }
    setPlacing(true);
    setError(null);
    try {
      const order = await apiFetch<{ id: string }>("/orders", {
        method: "POST",
        accessToken,
        body: { addressId, paymentMethod, paymentReceiptUrl: receiptUrl },
      });
      await cart.refresh();
      router.push(`/checkout/placed?orderId=${order.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not place your order — please try again.");
    } finally {
      setPlacing(false);
    }
  }

  if (authLoading || !user) return null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="mb-6 text-[22px]">Checkout</h1>

      <section className="mb-6 rounded-card border border-border bg-white p-5">
        <h2 className="mb-3 text-[15px] font-semibold text-text-dark">Delivery Address</h2>
        {addresses.length === 0 ? (
          <p className="text-[13px] text-text-muted">
            No saved addresses yet.{" "}
            <a href="/account/addresses" className="font-semibold text-primary">
              Add one
            </a>
            .
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {addresses.map((addr) => (
              <label
                key={addr.id}
                className={`flex cursor-pointer items-start gap-3 rounded-control border p-3 text-[13px] ${
                  addressId === addr.id ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  checked={addressId === addr.id}
                  onChange={() => setAddressId(addr.id)}
                  className="mt-1"
                />
                <span>
                  <span className="block font-medium text-text-dark">{addr.label}</span>
                  <span className="block text-text-secondary">{addr.address}</span>
                  <span className="block text-text-muted">{addr.phone}</span>
                </span>
              </label>
            ))}
          </div>
        )}
      </section>

      <section className="mb-6 rounded-card border border-border bg-white p-5">
        <h2 className="mb-3 text-[15px] font-semibold text-text-dark">Payment</h2>
        <div className="mb-4 flex gap-2">
          {(["FONEPAY", "BANK_TRANSFER"] as const).map((method) => (
            <button
              key={method}
              onClick={() => setPaymentMethod(method)}
              className={`rounded-control border px-4 py-2 text-[12px] font-medium ${
                paymentMethod === method ? "border-primary bg-primary text-white" : "border-border text-text-secondary"
              }`}
            >
              {method === "FONEPAY" ? "Fonepay QR" : "Bank Transfer"}
            </button>
          ))}
        </div>

        {paymentMethod === "FONEPAY" && (
          <div className="mb-4 flex items-center gap-4">
            <Image src="/fonepay-qr.png" alt="Fonepay QR code" width={140} height={140} className="rounded-control border border-border" />
            <p className="text-[12px] text-text-secondary">
              Scan with your banking app, pay {formatNPR(cart.total)}, then upload a screenshot of the receipt below.
            </p>
          </div>
        )}

        <label className="mb-1 block text-[12px] text-text-secondary">Payment receipt</label>
        <input type="file" accept="image/*,application/pdf" onChange={handleReceiptChange} className="text-[13px]" />
        {uploading && <p className="mt-1 text-[12px] text-text-muted">Uploading…</p>}
        {receiptUrl && <p className="mt-1 text-[12px] text-success">Receipt uploaded ✓</p>}
      </section>

      <section className="mb-6 rounded-card border border-border bg-white p-5">
        <div className="flex justify-between text-[13px] text-text-secondary">
          <span>Subtotal</span>
          <span>{formatNPR(cart.subtotal)}</span>
        </div>
        <div className="flex justify-between text-[13px] text-text-secondary">
          <span>Delivery fee</span>
          <span>{formatNPR(cart.deliveryFee)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-border pt-2 font-heading text-[16px] font-bold text-text-dark">
          <span>Total</span>
          <span>{formatNPR(cart.total)}</span>
        </div>
      </section>

      {error && <p className="mb-4 text-[13px] text-error">{error}</p>}

      <button
        onClick={placeOrder}
        disabled={placing || cart.items.length === 0}
        className="w-full rounded-control bg-primary px-5 py-3 text-[14px] font-semibold text-white disabled:opacity-60"
      >
        {placing ? "Placing order…" : "Place Order"}
      </button>
    </div>
  );
}
