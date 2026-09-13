import type { B2BAccount } from "./b2b-auth-types";
import type { Product } from "./catalog-types";
import type { CourierAccount } from "./courier-auth-types";
import type { Delivery } from "./delivery-types";
import type { LedgerCategory, LedgerPayment, PartyType } from "./ledger-types";
import type { Order, OrderItem } from "./order-types";
import type { Pet } from "./pet-types";
import type { Doctor, VetBooking } from "./vet-types";

/**
 * Everything the Finance ledger needs, gathered from each feature's own context. This module
 * never mutates or persists anything -- it only derives ledger-shaped views (income, payables,
 * party statements) live from data that's already the single source of truth elsewhere (orders,
 * vet bookings, deliveries, pet sales). The one thing with no other source of truth --
 * LedgerPayment records -- comes from LedgerContext.
 */
export type LedgerInputs = {
  orders: Order[];
  products: Product[];
  bookings: VetBooking[];
  doctors: Doctor[];
  deliveries: Delivery[];
  couriers: CourierAccount[];
  b2bAccounts: B2BAccount[];
  pets: Pet[];
  payments: LedgerPayment[];
};

export type PartySummary = {
  partyType: PartyType;
  partyId: string;
  name: string;
  totalBilled: number;
  totalOwed: number;
  totalPaid: number;
  balance: number;
};

export type VoucherRow = {
  key: string;
  date: number;
  particulars: string;
  vchType: string;
  vchNo: string;
  debit: number;
  credit: number;
  balance: number;
};

export type MainLedgerRowType = "sale_received" | "commission_earned" | "payable_created" | "payment_made";

export type MainLedgerRow = {
  key: string;
  date: number;
  ref: string;
  type: MainLedgerRowType;
  category: LedgerCategory;
  partyType: PartyType | null;
  partyId: string | null;
  partyName: string;
  debit: number;
  credit: number;
};

function productMap(products: Product[]): Map<string, Product> {
  return new Map(products.map((p) => [p.id, p]));
}

function b2bIdByCompanyName(b2bAccounts: B2BAccount[]): Map<string, string> {
  return new Map(b2bAccounts.map((a) => [a.companyName, a.b2bId]));
}

type ItemSplit = { gross: number; commission: number; payable: number; b2bId: string | null };

/** How one order item's sale splits between City Pet House's commission and the supplier's payable. */
function splitItem(item: OrderItem, products: Map<string, Product>, companyToB2bId: Map<string, string>): ItemSplit {
  const gross = item.price * item.qty;
  const product = products.get(item.productId);
  const b2bId = product?.suppliedBy ? (companyToB2bId.get(product.suppliedBy) ?? null) : null;
  if (!product || !b2bId) return { gross, commission: gross, payable: 0, b2bId: null };
  const commission = Math.round(gross * (product.commissionPercent / 100));
  return { gross, commission, payable: gross - commission, b2bId };
}

/** A recognized (payment-approved) order's items. Payment-rejected and fully-refunded orders
 * never contribute -- item-level refunds are already removed from `order.items` by OrderContext. */
function recognizedOrders(orders: Order[]): Order[] {
  return orders.filter((o) => o.approvedAt != null && !o.refunded);
}

function doctorEarning(booking: VetBooking, doctor: Doctor | undefined): { commission: number; earning: number } {
  if (!doctor) return { commission: 0, earning: booking.amount };
  const commission = doctor.commissionType === "percent" ? Math.round((booking.amount * doctor.commissionValue) / 100) : doctor.commissionValue;
  return { commission, earning: Math.max(0, booking.amount - commission) };
}

/** The completed (commission-recognized) bookings for one doctor, or all doctors if omitted. */
function completedBookings(bookings: VetBooking[], doctorId?: string): VetBooking[] {
  return bookings.filter((b) => b.completedAt != null && (doctorId === undefined || b.doctorId === doctorId));
}

/** Delivered orders assigned to one courier, or all couriers if omitted -- the delivery fee on
 * each is what's owed to whichever courier completed it. */
function deliveredFor(orders: Order[], deliveries: Delivery[], courierId?: string): { order: Order; delivery: Delivery }[] {
  const byId = new Map(orders.map((o) => [o.id, o]));
  const out: { order: Order; delivery: Delivery }[] = [];
  for (const d of deliveries) {
    if (d.status !== "Delivered") continue;
    if (courierId !== undefined && d.courierId !== courierId) continue;
    const order = byId.get(d.id);
    if (order) out.push({ order, delivery: d });
  }
  return out;
}

function partyName(inputs: LedgerInputs, partyType: PartyType, partyId: string): string {
  if (partyType === "b2b") return inputs.b2bAccounts.find((a) => a.b2bId === partyId)?.companyName ?? partyId;
  if (partyType === "doctor") return inputs.doctors.find((d) => d.id === partyId)?.name ?? partyId;
  return inputs.couriers.find((c) => c.courierId === partyId)?.companyName ?? partyId;
}

/** Every B2B supplier, doctor, and courier the ledger can show a statement for. */
export function allParties(inputs: LedgerInputs): { partyType: PartyType; partyId: string; name: string }[] {
  return [
    ...inputs.b2bAccounts.map((a) => ({ partyType: "b2b" as const, partyId: a.b2bId, name: a.companyName })),
    ...inputs.doctors.map((d) => ({ partyType: "doctor" as const, partyId: d.id, name: d.name })),
    ...inputs.couriers.map((c) => ({ partyType: "courier" as const, partyId: c.courierId, name: c.companyName })),
  ];
}

function paymentsFor(payments: LedgerPayment[], partyType: PartyType, partyId: string): number {
  return payments.filter((p) => p.partyType === partyType && p.partyId === partyId).reduce((sum, p) => sum + p.amount, 0);
}

export function partySummary(inputs: LedgerInputs, partyType: PartyType, partyId: string): PartySummary {
  const products = productMap(inputs.products);
  const companyToB2bId = b2bIdByCompanyName(inputs.b2bAccounts);
  let totalBilled = 0;
  let totalOwed = 0;

  if (partyType === "b2b") {
    for (const o of recognizedOrders(inputs.orders)) {
      for (const it of o.items) {
        const split = splitItem(it, products, companyToB2bId);
        if (split.b2bId !== partyId) continue;
        totalBilled += split.gross;
        totalOwed += split.payable;
      }
    }
  } else if (partyType === "doctor") {
    const doctor = inputs.doctors.find((d) => d.id === partyId);
    for (const b of completedBookings(inputs.bookings, partyId)) {
      const { earning } = doctorEarning(b, doctor);
      totalBilled += b.amount;
      totalOwed += earning;
    }
  } else {
    for (const { order } of deliveredFor(inputs.orders, inputs.deliveries, partyId)) {
      totalBilled += order.deliveryFee;
      totalOwed += order.deliveryFee;
    }
  }

  const totalPaid = paymentsFor(inputs.payments, partyType, partyId);
  return {
    partyType,
    partyId,
    name: partyName(inputs, partyType, partyId),
    totalBilled: Math.round(totalBilled),
    totalOwed: Math.round(totalOwed),
    totalPaid: Math.round(totalPaid),
    balance: Math.round(totalOwed - totalPaid),
  };
}

export function partySummaries(inputs: LedgerInputs): PartySummary[] {
  return allParties(inputs).map((p) => partySummary(inputs, p.partyType, p.partyId));
}

/** Voucher-style statement for one party: every payable-creating event as a credit, every
 * recorded payment as a debit, oldest first with a running balance. */
export function partyVoucherRows(inputs: LedgerInputs, partyType: PartyType, partyId: string): VoucherRow[] {
  const products = productMap(inputs.products);
  const companyToB2bId = b2bIdByCompanyName(inputs.b2bAccounts);
  type RawRow = { date: number; particulars: string; vchType: string; vchNo: string; debit: number; credit: number };
  const rows: RawRow[] = [];

  if (partyType === "b2b") {
    for (const o of recognizedOrders(inputs.orders)) {
      let payable = 0;
      const names: string[] = [];
      for (const it of o.items) {
        const split = splitItem(it, products, companyToB2bId);
        if (split.b2bId !== partyId) continue;
        payable += split.payable;
        names.push(`${it.name} ×${it.qty}`);
      }
      if (payable > 0) {
        rows.push({ date: o.approvedAt ?? o.createdAt, particulars: names.join(", "), vchType: "Sale", vchNo: o.id, debit: 0, credit: payable });
      }
    }
  } else if (partyType === "doctor") {
    const doctor = inputs.doctors.find((d) => d.id === partyId);
    for (const b of completedBookings(inputs.bookings, partyId)) {
      const { earning } = doctorEarning(b, doctor);
      if (earning > 0) {
        rows.push({ date: b.completedAt ?? b.createdAt, particulars: `Consult — ${b.petName} (${b.ownerName})`, vchType: "Consult", vchNo: b.id, debit: 0, credit: earning });
      }
    }
  } else {
    for (const { order, delivery } of deliveredFor(inputs.orders, inputs.deliveries, partyId)) {
      if (order.deliveryFee > 0) {
        rows.push({
          date: delivery.deliveredAt ?? order.createdAt,
          particulars: `Delivery — ${order.ownerName}`,
          vchType: "Delivery",
          vchNo: order.id,
          debit: 0,
          credit: order.deliveryFee,
        });
      }
    }
  }

  for (const p of inputs.payments) {
    if (p.partyType !== partyType || p.partyId !== partyId) continue;
    rows.push({ date: new Date(p.paymentDate).getTime() || p.createdAt, particulars: p.notes || "Payment made", vchType: "Payment", vchNo: p.id, debit: p.amount, credit: 0 });
  }

  rows.sort((a, b) => a.date - b.date);
  let balance = 0;
  return rows.map((r, i) => {
    balance += r.credit - r.debit;
    return { key: `${r.vchNo}-${i}`, ...r, balance: Math.round(balance) };
  });
}

/** Income (City Pet House's commission) recognized so far, grouped by category. */
export function incomeByCategory(inputs: LedgerInputs): Record<LedgerCategory, number> {
  const products = productMap(inputs.products);
  const companyToB2bId = b2bIdByCompanyName(inputs.b2bAccounts);
  const totals: Record<LedgerCategory, number> = { accessories: 0, pet_sales: 0, vet: 0 };

  for (const o of recognizedOrders(inputs.orders)) {
    for (const it of o.items) {
      totals.accessories += splitItem(it, products, companyToB2bId).commission;
    }
  }
  for (const b of completedBookings(inputs.bookings)) {
    const doctor = inputs.doctors.find((d) => d.id === b.doctorId);
    totals.vet += doctorEarning(b, doctor).commission;
  }
  for (const p of inputs.pets) {
    if (p.status === "Sold" && p.saleAmount) totals.pet_sales += p.saleAmount;
  }

  return { accessories: Math.round(totals.accessories), pet_sales: Math.round(totals.pet_sales), vet: Math.round(totals.vet) };
}

export type MonthlyIncomeRow = { monthKey: string; monthLabel: string; accessories: number; pet_sales: number; vet: number; total: number };

/** Same income as incomeByCategory(), bucketed by month -- newest month first. */
export function monthlyIncome(inputs: LedgerInputs): MonthlyIncomeRow[] {
  const products = productMap(inputs.products);
  const companyToB2bId = b2bIdByCompanyName(inputs.b2bAccounts);
  const byMonth = new Map<string, { accessories: number; pet_sales: number; vet: number }>();

  const bucket = (ts: number) => {
    const d = new Date(ts);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!byMonth.has(key)) byMonth.set(key, { accessories: 0, pet_sales: 0, vet: 0 });
    return byMonth.get(key)!;
  };

  for (const o of recognizedOrders(inputs.orders)) {
    const row = bucket(o.approvedAt ?? o.createdAt);
    for (const it of o.items) row.accessories += splitItem(it, products, companyToB2bId).commission;
  }
  for (const b of completedBookings(inputs.bookings)) {
    const doctor = inputs.doctors.find((d) => d.id === b.doctorId);
    bucket(b.completedAt ?? b.createdAt).vet += doctorEarning(b, doctor).commission;
  }
  for (const p of inputs.pets) {
    if (p.status === "Sold" && p.saleAmount && p.soldAt) bucket(p.soldAt).pet_sales += p.saleAmount;
  }

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return Array.from(byMonth.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([key, v]) => {
      const [year, month] = key.split("-");
      return {
        monthKey: key,
        monthLabel: `${monthNames[Number(month) - 1]} ${year}`,
        accessories: Math.round(v.accessories),
        pet_sales: Math.round(v.pet_sales),
        vet: Math.round(v.vet),
        total: Math.round(v.accessories + v.pet_sales + v.vet),
      };
    });
}

/** Pending orders/bookings awaiting payment approval -- money City Pet House expects but hasn't
 * confirmed receipt of yet. */
export function receivableTotal(inputs: LedgerInputs): number {
  let total = 0;
  for (const o of inputs.orders) {
    if (o.status === "Receipt Uploaded") total += o.total;
  }
  for (const b of inputs.bookings) {
    if (b.status === "Payment Review") total += b.amount;
  }
  return Math.round(total);
}

/** The full flat ledger feed, newest first -- every sale/commission/payable/payment row across
 * every category and party, for the Main Ledger view's filters to slice. */
export function mainLedgerRows(inputs: LedgerInputs): MainLedgerRow[] {
  const products = productMap(inputs.products);
  const companyToB2bId = b2bIdByCompanyName(inputs.b2bAccounts);
  const rows: MainLedgerRow[] = [];

  for (const o of recognizedOrders(inputs.orders)) {
    const date = o.approvedAt ?? o.createdAt;
    let gross = 0;
    let commission = 0;
    for (const it of o.items) {
      const split = splitItem(it, products, companyToB2bId);
      gross += split.gross;
      commission += split.commission;
      if (split.payable > 0 && split.b2bId) {
        rows.push({
          key: `${o.id}-payable-${it.productId}`,
          date,
          ref: o.id,
          type: "payable_created",
          category: "accessories",
          partyType: "b2b",
          partyId: split.b2bId,
          partyName: partyName(inputs, "b2b", split.b2bId),
          debit: 0,
          credit: Math.round(split.payable),
        });
      }
    }
    rows.push({ key: `${o.id}-sale`, date, ref: o.id, type: "sale_received", category: "accessories", partyType: null, partyId: null, partyName: "—", debit: Math.round(gross), credit: 0 });
    if (commission > 0) {
      rows.push({ key: `${o.id}-commission`, date, ref: o.id, type: "commission_earned", category: "accessories", partyType: null, partyId: null, partyName: "—", debit: 0, credit: Math.round(commission) });
    }
  }

  for (const { order, delivery } of deliveredFor(inputs.orders, inputs.deliveries)) {
    if (order.deliveryFee <= 0 || !delivery.courierId) continue;
    rows.push({
      key: `${order.id}-courier-payable`,
      date: delivery.deliveredAt ?? order.createdAt,
      ref: order.id,
      type: "payable_created",
      category: "accessories",
      partyType: "courier",
      partyId: delivery.courierId,
      partyName: partyName(inputs, "courier", delivery.courierId),
      debit: 0,
      credit: Math.round(order.deliveryFee),
    });
  }

  for (const b of completedBookings(inputs.bookings)) {
    const doctor = inputs.doctors.find((d) => d.id === b.doctorId);
    const { commission, earning } = doctorEarning(b, doctor);
    const date = b.completedAt ?? b.createdAt;
    rows.push({ key: `${b.id}-sale`, date, ref: b.id, type: "sale_received", category: "vet", partyType: null, partyId: null, partyName: "—", debit: Math.round(b.amount), credit: 0 });
    if (commission > 0) {
      rows.push({ key: `${b.id}-commission`, date, ref: b.id, type: "commission_earned", category: "vet", partyType: null, partyId: null, partyName: "—", debit: 0, credit: Math.round(commission) });
    }
    if (earning > 0) {
      rows.push({ key: `${b.id}-payable`, date, ref: b.id, type: "payable_created", category: "vet", partyType: "doctor", partyId: b.doctorId, partyName: partyName(inputs, "doctor", b.doctorId), debit: 0, credit: Math.round(earning) });
    }
  }

  for (const p of inputs.pets) {
    if (p.status !== "Sold" || !p.saleAmount) continue;
    const date = p.soldAt ?? 0;
    rows.push({ key: `${p.id}-sale`, date, ref: p.id, type: "sale_received", category: "pet_sales", partyType: null, partyId: null, partyName: "—", debit: p.saleAmount, credit: 0 });
    rows.push({ key: `${p.id}-commission`, date, ref: p.id, type: "commission_earned", category: "pet_sales", partyType: null, partyId: null, partyName: "—", debit: 0, credit: p.saleAmount });
  }

  for (const pay of inputs.payments) {
    const category: LedgerCategory = pay.partyType === "doctor" ? "vet" : "accessories";
    rows.push({
      key: `${pay.id}`,
      date: new Date(pay.paymentDate).getTime() || pay.createdAt,
      ref: pay.reference || pay.id,
      type: "payment_made",
      category,
      partyType: pay.partyType,
      partyId: pay.partyId,
      partyName: partyName(inputs, pay.partyType, pay.partyId),
      debit: Math.round(pay.amount),
      credit: 0,
    });
  }

  return rows.sort((a, b) => b.date - a.date);
}
