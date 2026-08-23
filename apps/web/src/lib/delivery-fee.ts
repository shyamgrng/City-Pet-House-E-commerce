import type { CourierAccount } from "./courier-auth-types";
import { type CourierPackageSize, courierPackageSizes } from "./catalog-types";

export type DeliveryFeeInput = {
  /** One entry per distinct product in the cart, with its line subtotal and package size. */
  items: { subtotal: number; tier: CourierPackageSize }[];
  courier: CourierAccount | null;
  standardFee: number;
  freeDeliveryThreshold: number;
  /** The highest tier that still qualifies for the free-delivery waiver (e.g. "Medium" = Small & Medium qualify). */
  freeDeliveryMaxTier: CourierPackageSize;
};

export type DeliveryFeeResult = {
  fee: number;
  tier: CourierPackageSize | null;
  courierName: string;
  freeDeliveryApplied: boolean;
  freeDeliveryBlockedReason: string | null;
  amountToUnlockFreeDelivery: number | null;
};

const tierRank = (t: CourierPackageSize) => courierPackageSizes.indexOf(t);

function rateForTier(courier: CourierAccount, tier: CourierPackageSize): number {
  switch (tier) {
    case "Small":
      return courier.priceSmall;
    case "Medium":
      return courier.priceMedium;
    case "Large":
      return courier.priceLarge;
    case "Very Large":
      return courier.priceVeryLarge;
  }
}

export function calculateDeliveryFee({
  items,
  courier,
  standardFee,
  freeDeliveryThreshold,
  freeDeliveryMaxTier,
}: DeliveryFeeInput): DeliveryFeeResult {
  if (items.length === 0) {
    return { fee: 0, tier: null, courierName: "", freeDeliveryApplied: false, freeDeliveryBlockedReason: null, amountToUnlockFreeDelivery: null };
  }

  const tier = items.reduce<CourierPackageSize>((highest, i) => (tierRank(i.tier) > tierRank(highest) ? i.tier : highest), "Small");
  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);

  const courierRate = courier ? rateForTier(courier, tier) : 0;
  const baseFee = courier && courierRate > 0 ? courierRate : standardFee;
  const courierName = courier ? courier.companyName : "Standard";

  const tierQualifies = tierRank(tier) <= tierRank(freeDeliveryMaxTier);
  const meetsThreshold = subtotal >= freeDeliveryThreshold;

  if (meetsThreshold && tierQualifies) {
    return { fee: 0, tier, courierName, freeDeliveryApplied: true, freeDeliveryBlockedReason: null, amountToUnlockFreeDelivery: null };
  }

  if (meetsThreshold && !tierQualifies) {
    return {
      fee: baseFee,
      tier,
      courierName,
      freeDeliveryApplied: false,
      freeDeliveryBlockedReason: `Free delivery doesn't apply to oversized items in your cart (contains a "${tier}" item).`,
      amountToUnlockFreeDelivery: null,
    };
  }

  return {
    fee: baseFee,
    tier,
    courierName,
    freeDeliveryApplied: false,
    freeDeliveryBlockedReason: null,
    amountToUnlockFreeDelivery: tierQualifies ? freeDeliveryThreshold - subtotal : null,
  };
}
