"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MediaSlot from "@/components/MediaSlot";
import PaymentMethodPanel from "@/components/PaymentMethodPanel";
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
import { calculateCourierCost, calculateDeliveryFee, type CourierCostResult, type DeliveryFeeResult } from "@/lib/delivery-fee";
import { isValidNepalPhone } from "@/lib/phone";

function useCartDeliveryFee(items: CartItem[]) {
  const { products } = useCatalog();
  const { accounts: couriers } = useCourierAuth();
  const { standardFeeSmall, standardFeeMedium, standardFeeLarge, standardFeeVeryLarge, feeTiers, freeDeliveryMaxTier } = useDeliverySettings();

  const feeItems = items.map((it) => {
    const product = products.find((p) => p.id === it.productId);
    return { subtotal: it.price * it.qty, tier: product?.courierPackageSize ?? "Small" };
  });
  const activeCourier = couriers.find((c) => c.isActive) ?? null;
  const standardRates = { standardFeeSmall, standardFeeMedium, standardFeeLarge, standardFeeVeryLarge };

  const deliveryResult = calculateDeliveryFee({ items: feeItems, standardRates, feeTiers, freeDeliveryMaxTier });
  const courierResult = calculateCourierCost(feeItems, activeCourier);

  return { deliveryResult, courierResult };
}

export default function CartPage() {
  const { user, ready } = useAuth();
  const { items, subtotal, inc, dec, remove, clear } = useCart();
  const { products } = useCatalog();
  const { placeOrder, saveError, clearSaveError } = useOrder();
  const { deliveryResult, courierResult } = useCartDeliveryFee(items);

  if (!ready) return null;

  const total = items.length > 0 ? subtotal + deliveryResult.fee : 0;

  return (
    <div className="px-4 md:px-8 py-7 max-w-[720px] mx-auto">
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
            <div key={it.productId} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2.5 px-4 py-3.5 border-b border-[#F0F2F4] last:border-0">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-[#F7F9FA]">
                  <MediaSlot src={product?.photo} label="product photo" className="w-full h-full text-[7px]" />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-[#1A2027] truncate">{it.name}</div>
                  <div className="text-xs text-[#8A96A3] mt-0.5">{formatRs(it.price)} each</div>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pl-14 sm:pl-0">
                <div className="flex items-center gap-2">
                  <button onClick={() => dec(it.productId)} className="w-7 h-7 rounded-md border border-[#E4E9EC] text-[#3A4652] font-bold cursor-pointer">
                    −
                  </button>
                  <div className="w-6 text-center text-xs font-semibold">{it.qty}</div>
                  <button onClick={() => inc(it.productId)} className="w-7 h-7 rounded-md border border-[#E4E9EC] text-[#3A4652] font-bold cursor-pointer">
                    +
                  </button>
                </div>
                <div className="w-[76px] text-right text-[13px] font-bold text-[#1A2027]">{formatRs(it.price * it.qty)}</div>
                <button onClick={() => remove(it.productId)} className="text-xs font-semibold text-[#D64545] cursor-pointer">
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
          courierResult={courierResult}
          placeOrder={placeOrder}
          saveError={saveError}
          clearSaveError={clearSaveError}
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
  courierResult,
  placeOrder,
  saveError,
  clearSaveError,
  clear,
}: {
  user: Account;
  items: CartItem[];
  subtotal: number;
  total: number;
  deliveryResult: DeliveryFeeResult;
  courierResult: CourierCostResult;
  placeOrder: ReturnType<typeof useOrder>["placeOrder"];
  saveError: string | null;
  clearSaveError: () => void;
  clear: () => void;
}) {
  const router = useRouter();
  const { methods } = usePaymentMethods();
  const activeMethods = methods.filter((m) => m.active);
  const DELIVERY_FEE = deliveryResult.fee;
  const [address, setAddress] = useState(user.address);
  const [phone, setPhone] = useState(user.phone);
  const [selectedMethodKey, setSelectedMethodKey] = useState(activeMethods[0]?.key ?? "");
  const [fonepayVerified, setFonepayVerified] = useState(false);
  const [error, setError] = useState("");

  // A saveError left over from an earlier, unrelated failed save (e.g. a previous order
  // attempt) must not be shown as if it belonged to this fresh checkout session.
  useEffect(() => {
    clearSaveError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The seed's payment methods render first (before live data loads); once the real list
  // arrives, fall back off a method that turned out to be inactive/missing.
  useEffect(() => {
    if (activeMethods.length > 0 && !activeMethods.some((m) => m.key === selectedMethodKey)) {
      setSelectedMethodKey(activeMethods[0].key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMethods]);

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
    if (!selectedMethodKey) {
      setError("Please choose a payment method.");
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
      courierCost: courierResult.cost,
      courierName: courierResult.courierName,
      total,
      paymentMethod: selectedMethodKey,
      fonepayVerified,
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
        <div className="text-[11px] text-[#8A96A3] mt-2.5">Delivery — {deliveryResult.freeDeliveryApplied ? "Free" : formatRs(DELIVERY_FEE)}</div>
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
        <div className="text-sm font-bold text-[#1A2027] mb-1">Payment</div>
        <div className="text-xs text-[#5B6773] mb-4 leading-relaxed">
          Choose how you&apos;d like to pay, then confirm below once you&apos;ve sent the payment — your order will be held pending
          admin approval.
        </div>
        <PaymentMethodPanel
          methods={activeMethods}
          amount={total}
          reference={`cart-${user.id}`}
          remarks1="City Pet House"
          remarks2="Order Payment"
          selectedKey={selectedMethodKey}
          onSelect={setSelectedMethodKey}
          onFonepayVerifiedChange={setFonepayVerified}
        />
      </div>

      {(error || saveError) && <div className="text-xs text-[#D64545] mb-3">{error || saveError}</div>}
      <button onClick={submit} className="w-full bg-primary text-white text-center py-3.5 rounded-[9px] text-sm font-semibold cursor-pointer">
        I&apos;ve Paid — Place Order
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
