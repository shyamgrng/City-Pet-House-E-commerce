"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import MediaSlot from "@/components/MediaSlot";
import PhoneInput from "@/components/PhoneInput";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useCatalog } from "@/context/CatalogContext";
import { useCourierAuth } from "@/context/CourierAuthContext";
import { useDeliverySettings } from "@/context/DeliverySettingsContext";
import { useOrder } from "@/context/OrderContext";
import { usePaymentMethods } from "@/context/PaymentMethodsContext";
import type { Account } from "@/lib/auth-types";
import { formatRs } from "@/lib/catalog-types";
import type { CartItem } from "@/lib/cart-types";
import { calculateDeliveryFee, type DeliveryFeeResult } from "@/lib/delivery-fee";
import { resizeImageFile } from "@/lib/image-upload";
import { isValidNepalPhone } from "@/lib/phone";

function useCartDeliveryFee(items: CartItem[]) {
  const { products } = useCatalog();
  const { accounts: couriers } = useCourierAuth();
  const { standardFee, freeDeliveryThreshold, freeDeliveryMaxTier } = useDeliverySettings();

  const feeItems = items.map((it) => {
    const product = products.find((p) => p.id === it.productId);
    return { subtotal: it.price * it.qty, tier: product?.courierPackageSize ?? "Small" };
  });
  const activeCourier = couriers.find((c) => c.isActive) ?? null;

  return calculateDeliveryFee({ items: feeItems, courier: activeCourier, standardFee, freeDeliveryThreshold, freeDeliveryMaxTier });
}

export default function CartPage() {
  const { user, ready } = useAuth();
  const { items, subtotal, inc, dec, remove, clear } = useCart();
  const { products } = useCatalog();
  const { placeOrder } = useOrder();
  const deliveryResult = useCartDeliveryFee(items);

  if (!ready) return null;

  const total = items.length > 0 ? subtotal + deliveryResult.fee : 0;

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
          {items.map((it) => {
            const product = products.find((p) => p.id === it.productId);
            return (
            <div key={it.productId} className="flex justify-between items-center px-4 py-3.5 border-b border-[#F0F2F4] last:border-0">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-[#F7F9FA]">
                  <MediaSlot src={product?.photo} label="product photo" className="w-full h-full text-[7px]" />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-[#1A2027] truncate">{it.name}</div>
                  <div className="text-xs text-[#8A96A3] mt-0.5">{formatRs(it.price)} each</div>
                </div>
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
            );
          })}
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
        <CheckoutSection
          user={user}
          items={items}
          subtotal={subtotal}
          total={total}
          deliveryResult={deliveryResult}
          placeOrder={placeOrder}
          clear={clear}
        />
      )}
    </div>
  );
}

function CheckoutSection({
  user,
  items,
  subtotal,
  total,
  deliveryResult,
  placeOrder,
  clear,
}: {
  user: Account;
  items: CartItem[];
  subtotal: number;
  total: number;
  deliveryResult: DeliveryFeeResult;
  placeOrder: ReturnType<typeof useOrder>["placeOrder"];
  clear: () => void;
}) {
  const router = useRouter();
  const { methods } = usePaymentMethods();
  const activeMethods = methods.filter((m) => m.active);
  const DELIVERY_FEE = deliveryResult.fee;
  const [address, setAddress] = useState(user.address);
  const [phone, setPhone] = useState(user.phone);
  const [receiptPhoto, setReceiptPhoto] = useState("");
  const [error, setError] = useState("");
  const [previewQr, setPreviewQr] = useState<{ src: string; label: string } | null>(null);
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
        <div className="text-[11px] text-[#8A96A3] mt-2.5">
          Delivery — {deliveryResult.freeDeliveryApplied ? "Free" : formatRs(DELIVERY_FEE)}
          {deliveryResult.courierName && ` via ${deliveryResult.courierName}`}
        </div>
      </div>

      <div className="border border-[#E4E9EC] rounded-xl p-4 mb-6">
        <div className="text-[13px] font-bold text-[#1A2027] mb-3">Order Summary</div>
        <SummaryRow label="Subtotal" value={formatRs(subtotal)} />
        <SummaryRow label="Delivery Fee" value={deliveryResult.freeDeliveryApplied ? "Free" : formatRs(DELIVERY_FEE)} />
        {deliveryResult.freeDeliveryApplied && (
          <div className="text-[11px] font-semibold text-[#1F7A4D] bg-[#E7F3EC] rounded-md px-2.5 py-1.5 mt-1 mb-1 inline-block">
            Free delivery applied 🎉
          </div>
        )}
        {deliveryResult.freeDeliveryBlockedReason && (
          <div className="text-[11px] text-[#8A6D1F] bg-[#FFF8E8] rounded-md px-2.5 py-1.5 mt-1 mb-1">
            {deliveryResult.freeDeliveryBlockedReason}
          </div>
        )}
        {deliveryResult.amountToUnlockFreeDelivery !== null && (
          <div className="text-[11px] text-[#146A8C] bg-[#EAF4F9] rounded-md px-2.5 py-1.5 mt-1 mb-1">
            Add {formatRs(deliveryResult.amountToUnlockFreeDelivery)} more to unlock free delivery
          </div>
        )}
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
        <div className="flex gap-3 justify-center mb-4 flex-wrap">
          {activeMethods.map((pm) => (
            <div key={pm.key} className="text-center">
              <div
                onClick={() => pm.qrImage && setPreviewQr({ src: pm.qrImage, label: pm.label })}
                className="w-[92px] h-[92px] mb-1 rounded-lg bg-white overflow-hidden"
                style={{ cursor: pm.qrImage ? "zoom-in" : "default" }}
              >
                <MediaSlot src={pm.qrImage} label="QR" className="w-full h-full text-[9px] font-mono" />
              </div>
              <div className="text-[11px] font-semibold text-[#1A2027]">{pm.label}</div>
            </div>
          ))}
        </div>

        {previewQr && (
          <div
            onClick={() => setPreviewQr(null)}
            className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-[70] p-6"
          >
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-5 max-w-[92vw]">
              <div className="text-center text-sm font-bold text-[#1A2027] mb-3">{previewQr.label}</div>
              {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded data: URL, shown full-size for scanning */}
              <img src={previewQr.src} alt={`${previewQr.label} QR code`} className="w-[min(80vw,340px)] h-[min(80vw,340px)] object-contain mx-auto" />
            </div>
            <button
              onClick={() => setPreviewQr(null)}
              className="mt-4 text-white text-sm font-semibold bg-white/15 px-5 py-2 rounded-lg cursor-pointer"
            >
              Close
            </button>
          </div>
        )}

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
