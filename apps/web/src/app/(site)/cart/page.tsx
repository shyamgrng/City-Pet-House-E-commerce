"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import PhoneInput from "@/components/PhoneInput";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useDeliverySettings } from "@/context/DeliverySettingsContext";
import { useOrder } from "@/context/OrderContext";
import type { Account } from "@/lib/auth-types";
import { formatRs } from "@/lib/catalog-types";
import type { CartItem } from "@/lib/cart-types";
import { resizeImageFile } from "@/lib/image-upload";
import { isValidNepalPhone } from "@/lib/phone";

const PAYMENT_METHODS = ["eSewa", "Khalti", "Bank Transfer"];

export default function CartPage() {
  const { user, ready } = useAuth();
  const { items, subtotal, inc, dec, remove, clear } = useCart();
  const { placeOrder } = useOrder();
  const { standardFee: DELIVERY_FEE } = useDeliverySettings();

  if (!ready) return null;

  const total = items.length > 0 ? subtotal + DELIVERY_FEE : 0;

  return (
    <div className="px-8 py-7 max-w-[720px] mx-auto">
      <div className="font-heading font-bold text-xl text-[#1A2027] mb-5">Cart &amp; Checkout</div>

      {items.length === 0 ? (
        <div className="border border-[#E4E9EC] rounded-2xl p-10 text-center text-sm text-[#8A96A3] mb-6">
          Your cart is empty.{" "}
          <Link href="/shop" className="text-primary font-semibold">
            Browse the Shop
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden mb-6">
          {items.map((it) => (
            <div key={it.productId} className="flex justify-between items-center px-4 py-3.5 border-b border-[#F0F2F4] last:border-0">
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#1A2027]">{it.name}</div>
                <div className="text-xs text-[#8A96A3] mt-0.5">{formatRs(it.price)} each</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => dec(it.productId)} className="w-7 h-7 rounded-md border border-[#E4E9EC] text-[#3A4652] font-bold cursor-pointer">
                  −
                </button>
                <div className="w-6 text-center text-xs font-semibold">{it.qty}</div>
                <button onClick={() => inc(it.productId)} className="w-7 h-7 rounded-md border border-[#E4E9EC] text-[#3A4652] font-bold cursor-pointer">
                  +
                </button>
                <div className="w-[76px] text-right text-[13px] font-bold text-[#1A2027]">{formatRs(it.price * it.qty)}</div>
                <button onClick={() => remove(it.productId)} className="text-xs font-semibold text-[#D64545] cursor-pointer ml-1">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && !user && (
        <div className="bg-[#FFF8E8] border border-[#F0DFB5] rounded-xl p-5 mb-6">
          <div className="text-sm font-bold text-[#8A6D1F] mb-1">Sign in to complete your order</div>
          <div className="text-xs text-[#5B6773] mb-3.5 leading-relaxed">
            Your cart is saved. Sign in to see payment details and upload your receipt.
          </div>
          <Link
            href="/signin?redirect=/cart"
            className="inline-block bg-primary text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold"
          >
            Sign In to Continue
          </Link>
        </div>
      )}

      {items.length > 0 && user && (
        <CheckoutSection user={user} items={items} subtotal={subtotal} total={total} placeOrder={placeOrder} clear={clear} />
      )}
    </div>
  );
}

function CheckoutSection({
  user,
  items,
  subtotal,
  total,
  placeOrder,
  clear,
}: {
  user: Account;
  items: CartItem[];
  subtotal: number;
  total: number;
  placeOrder: ReturnType<typeof useOrder>["placeOrder"];
  clear: () => void;
}) {
  const router = useRouter();
  const { standardFee: DELIVERY_FEE } = useDeliverySettings();
  const [address, setAddress] = useState(user.address);
  const [phone, setPhone] = useState(user.phone);
  const [receiptPhoto, setReceiptPhoto] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    try {
      const dataUrl = await resizeImageFile(file, 1000, 1400);
      setReceiptPhoto(dataUrl);
    } catch {
      setError("Could not process that image — try a different file.");
    }
  };

  const submit = () => {
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (!address.trim() || !phone.trim()) {
      setError("Please fill in your delivery address and phone.");
      return;
    }
    if (!isValidNepalPhone(phone)) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }
    if (!receiptPhoto) {
      setError("Please upload your payment receipt to continue.");
      return;
    }
    const id = placeOrder({
      ownerId: user.id,
      ownerName: user.name,
      ownerPhone: phone.trim(),
      ownerEmail: user.email,
      address: address.trim(),
      items: items.map((i) => ({ productId: i.productId, name: i.name, price: i.price, qty: i.qty })),
      subtotal,
      deliveryFee: DELIVERY_FEE,
      total,
      receiptPhoto,
    });
    clear();
    router.push(`/order/${id}`);
  };

  return (
    <>
      <div className="text-[13px] font-bold text-[#1A2027] mb-2.5">Delivery Address</div>
      <div className="border border-[#E4E9EC] rounded-xl p-4 mb-6">
        <div className="text-xs font-semibold text-[#3A4652] mb-1.5">📍 Address</div>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-3 box-border"
        />
        <div className="text-xs font-semibold text-[#3A4652] mb-1.5">📞 Phone</div>
        <PhoneInput value={phone} onChange={setPhone} className="" />
        <div className="text-[11px] text-[#8A96A3] mt-2.5">Delivery — {formatRs(DELIVERY_FEE)} (varies by item)</div>
      </div>

      <div className="border border-[#E4E9EC] rounded-xl p-4 mb-6">
        <div className="text-[13px] font-bold text-[#1A2027] mb-3">Order Summary</div>
        <SummaryRow label="Subtotal" value={formatRs(subtotal)} />
        <SummaryRow label="Delivery Fee" value={formatRs(DELIVERY_FEE)} />
        <div className="flex justify-between items-center pt-2.5 mt-1 border-t border-[#F0F2F4]">
          <span className="text-sm font-bold text-[#1A2027]">Total</span>
          <span className="text-lg font-bold text-primary">{formatRs(total)}</span>
        </div>
      </div>

      <div className="bg-[#EAF4F9] border border-[#CFE6F1] rounded-xl p-5 mb-4">
        <div className="text-sm font-bold text-[#1A2027] mb-1">Payment Instructions</div>
        <div className="text-xs text-[#5B6773] mb-4 leading-relaxed">
          Pay via any of the QR codes below. Upload your receipt screenshot — your order will be held for 6 hours pending admin
          approval.
        </div>
        <div className="flex gap-3 justify-center mb-4">
          {PAYMENT_METHODS.map((pm) => (
            <div key={pm} className="text-center">
              <div className="w-[92px] h-[92px] mb-1 rounded-lg bg-white flex items-center justify-center text-[9px] text-[#8A96A3] font-mono">
                QR
              </div>
              <div className="text-[11px] font-semibold text-[#1A2027]">{pm}</div>
            </div>
          ))}
        </div>

        <div className="text-xs font-semibold text-[#3A4652] mb-1.5">
          Upload Payment Receipt <span className="text-[#D64545]">*</span>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
        {receiptPhoto ? (
          <div className="mb-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={receiptPhoto} alt="payment receipt" className="w-full max-h-[220px] object-contain rounded-lg border border-[#C7DCE6] bg-white mb-2" />
            <button onClick={() => fileRef.current?.click()} className="text-xs font-semibold text-primary cursor-pointer">
              Replace
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full h-[120px] mb-1 rounded-lg border-2 border-dashed border-[#C7DCE6] bg-white flex items-center justify-center text-xs text-[#8A96A3] cursor-pointer"
          >
            Drop your payment receipt screenshot
          </button>
        )}
      </div>

      {error && <div className="text-xs text-[#D64545] mb-3">{error}</div>}
      <button onClick={submit} className="w-full bg-primary text-white text-center py-3.5 rounded-[9px] text-sm font-semibold cursor-pointer">
        Place Order &amp; Upload Receipt
      </button>
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1 text-xs text-[#5B6773]">
      <span>{label}</span>
      <span className="font-semibold text-[#1A2027]">{value}</span>
    </div>
  );
}
