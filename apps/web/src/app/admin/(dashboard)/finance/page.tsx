"use client";

import { useMemo, useState } from "react";
import { useB2BAuth } from "@/context/B2BAuthContext";
import { useCatalog } from "@/context/CatalogContext";
import { useCourierAuth } from "@/context/CourierAuthContext";
import { useDelivery } from "@/context/DeliveryContext";
import { useLedger } from "@/context/LedgerContext";
import { useOrder } from "@/context/OrderContext";
import { usePets } from "@/context/PetContext";
import { useVet } from "@/context/VetContext";
import { IMAGE_ACCEPT, isAllowedImageFile, resizeImageFile } from "@/lib/image-upload";
import {
  allParties,
  incomeByCategory,
  type LedgerInputs,
  mainLedgerRows,
  type MainLedgerRowType,
  monthlyIncome,
  partySummaries,
  partySummary,
  partyVoucherRows,
  receivableTotal,
} from "@/lib/ledger-selectors";
import { CATEGORY_LABELS, PARTY_TYPE_LABELS, PAYMENT_METHOD_LABELS, type LedgerCategory, type PartyType, type PaymentMethod } from "@/lib/ledger-types";

const subTabs = ["Overview", "Main Ledger", "Income", "Payable", "Accounts", "Refunds", "Cancellations", "Receivable", "Audit Log"] as const;
type Tab = (typeof subTabs)[number];
const ranges = ["Today", "Yesterday", "Last 7 days", "All time"] as const;

function rangeStartMs(range: (typeof ranges)[number]): number {
  const now = new Date();
  if (range === "Today") {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  if (range === "Yesterday") {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  if (range === "Last 7 days") return now.getTime() - 7 * 24 * 60 * 60 * 1000;
  return 0;
}

function fmt(n: number) {
  return "Rs. " + Math.round(n).toLocaleString("en-IN");
}

export default function FinancePage() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [range, setRange] = useState<(typeof ranges)[number]>("All time");
  const [selectedParty, setSelectedParty] = useState<{ partyType: PartyType; partyId: string } | null>(null);
  const [paymentDraft, setPaymentDraft] = useState<{ partyType: PartyType; partyId: string } | null>(null);

  const { orders, refunds } = useOrder();
  const { products } = useCatalog();
  const { bookings, doctors } = useVet();
  const { deliveries } = useDelivery();
  const { accounts: couriers } = useCourierAuth();
  const { accounts: b2bAccounts } = useB2BAuth();
  const { pets } = usePets();
  const { payments, addPayment, saveError } = useLedger();

  const inputs: LedgerInputs = useMemo(
    () => ({ orders, products, bookings, doctors, deliveries, couriers, b2bAccounts, pets, payments }),
    [orders, products, bookings, doctors, deliveries, couriers, b2bAccounts, pets, payments],
  );

  const rangeStart = rangeStartMs(range);

  const openStatement = (partyType: PartyType, partyId: string) => {
    setSelectedParty({ partyType, partyId });
  };

  return (
    <>
      {selectedParty ? (
        <PartyStatementView
          inputs={inputs}
          partyType={selectedParty.partyType}
          partyId={selectedParty.partyId}
          rangeStart={rangeStart}
          onBack={() => setSelectedParty(null)}
          onRecordPayment={() => setPaymentDraft(selectedParty)}
        />
      ) : (
        <div>
          <div className="flex gap-2 mb-4 flex-wrap">
            {subTabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                style={{ background: tab === t ? "#1996C8" : "#fff", color: tab === t ? "#fff" : "#3A4652", border: tab === t ? "none" : "1px solid #E4E9EC" }}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex gap-3 mb-5 flex-wrap items-center">
            <input
              placeholder="Search party, description, order/booking ID…"
              className="flex-1 min-w-[240px] border border-[#E4E9EC] rounded-lg px-3.5 py-2.5 text-[13px]"
            />
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                style={{ background: range === r ? "#1996C8" : "#F0F2F4", color: range === r ? "#fff" : "#5B6773" }}
              >
                {r}
              </button>
            ))}
          </div>

          {tab === "Overview" && <OverviewTab inputs={inputs} />}
          {tab === "Main Ledger" && <MainLedgerTab inputs={inputs} rangeStart={rangeStart} />}
          {tab === "Income" && <IncomeTab inputs={inputs} />}
          {tab === "Payable" && <PayableTab inputs={inputs} onOpenStatement={openStatement} onPay={(pt, pid) => setPaymentDraft({ partyType: pt, partyId: pid })} />}
          {tab === "Accounts" && <AccountsTab inputs={inputs} onOpenStatement={openStatement} />}
          {tab === "Refunds" && <RefundsTab refunds={refunds} rangeStart={rangeStart} />}
          {tab === "Cancellations" && <CancellationsTab orders={orders} bookings={bookings} rangeStart={rangeStart} />}
          {tab === "Receivable" && <ReceivableTab inputs={inputs} />}
          {tab === "Audit Log" && <AuditLogTab payments={payments} rangeStart={rangeStart} inputs={inputs} />}
        </div>
      )}

      {paymentDraft && (
        <PaymentModal
          inputs={inputs}
          initial={paymentDraft}
          saveError={saveError}
          onCancel={() => setPaymentDraft(null)}
          onSubmit={(input) => {
            if (addPayment(input)) setPaymentDraft(null);
          }}
        />
      )}
    </>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-4">
      <div className="text-[11px] text-[#8A96A3] font-semibold mb-2">{label}</div>
      <div className="font-heading font-bold text-xl" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function OverviewTab({ inputs }: { inputs: LedgerInputs }) {
  const income = incomeByCategory(inputs);
  const totalIncome = income.accessories + income.pet_sales + income.vet;
  const totalPayable = partySummaries(inputs).reduce((sum, p) => sum + Math.max(0, p.balance), 0);
  const receivable = receivableTotal(inputs);
  const totalRefunds = inputs.orders.reduce((sum, o) => sum + o.refundedItems.reduce((s, r) => s + r.price, 0) + (o.refunded ? o.total : 0), 0);

  return (
    <>
      <div className="font-heading font-bold text-base text-[#1A2027] mb-4">Finance Overview</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-3.5">
        <Stat label="Total Income" value={fmt(totalIncome)} color="#1F7A4D" />
        <Stat label="Total Refunds" value={fmt(totalRefunds)} color="#D64545" />
        <Stat label="Accounts Receivable" value={fmt(receivable)} color="#C9962B" />
        <Stat label="Net Revenue" value={fmt(totalIncome - totalRefunds)} color="#1A2027" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
        <Stat label="Accounts Payable" value={fmt(totalPayable)} color="#7A56C8" />
        <Stat label="Shop / Accessories Income" value={fmt(income.accessories)} color="#1996C8" />
        <Stat label="Web Vet Income" value={fmt(income.vet)} color="#17A2A0" />
      </div>

      <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-5">
        <div className="text-[13px] font-bold text-[#1A2027] mb-4">Income by Category</div>
        {(Object.keys(CATEGORY_LABELS) as LedgerCategory[]).map((cat) => {
          const amount = income[cat];
          const pct = totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0;
          return (
            <div key={cat} className="mb-4 last:mb-0">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-bold text-[#1A2027]">{CATEGORY_LABELS[cat]}</span>
                <span className="text-[#5B6773]">{fmt(amount)}</span>
              </div>
              <div className="h-1.5 bg-[#EEF1F3] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-[#1F7A4D]" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function IncomeTab({ inputs }: { inputs: LedgerInputs }) {
  const rows = monthlyIncome(inputs);
  const income = incomeByCategory(inputs);

  return (
    <>
      <div className="font-heading font-bold text-base text-[#1A2027] mb-1">Income Ledger</div>
      <div className="text-xs text-[#5B6773] mb-4">City Pet House&apos;s commission earned, grouped by category.</div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
        {(Object.keys(CATEGORY_LABELS) as LedgerCategory[]).map((cat) => (
          <Stat key={cat} label={CATEGORY_LABELS[cat]} value={fmt(income[cat])} color="#1F7A4D" />
        ))}
      </div>

      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
        <div className="grid grid-cols-4 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
          <div>Month</div>
          <div>Shop / Accessories</div>
          <div>Pet Sales</div>
          <div>Web Vet</div>
        </div>
        {rows.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No income recorded yet</div>
        ) : (
          rows.map((r) => (
            <div key={r.monthKey} className="grid grid-cols-4 px-4 py-3 text-xs items-center border-b border-[#F0F2F4] last:border-0">
              <div className="font-semibold text-[#1A2027]">{r.monthLabel}</div>
              <div>{fmt(r.accessories)}</div>
              <div>{fmt(r.pet_sales)}</div>
              <div>{fmt(r.vet)}</div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

const TYPE_LABELS: Record<MainLedgerRowType, string> = {
  sale_received: "Sale Received",
  commission_earned: "Commission Earned",
  payable_created: "Payable Created",
  payment_made: "Payment Made",
};

function MainLedgerTab({ inputs, rangeStart }: { inputs: LedgerInputs; rangeStart: number }) {
  const [typeFilter, setTypeFilter] = useState<MainLedgerRowType | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<LedgerCategory | "all">("all");
  const [partyFilter, setPartyFilter] = useState<string>("all");

  const parties = allParties(inputs);
  const rows = mainLedgerRows(inputs).filter((r) => {
    if (r.date < rangeStart) return false;
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
    if (partyFilter !== "all" && `${r.partyType}:${r.partyId}` !== partyFilter) return false;
    return true;
  });

  return (
    <>
      <div className="font-heading font-bold text-base text-[#1A2027] mb-1">Main Ledger</div>
      <div className="text-xs text-[#5B6773] mb-4">Every sale, commission, payable, and payment row across the whole business, filterable below.</div>

      <div className="flex gap-2.5 mb-4 flex-wrap">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as MainLedgerRowType | "all")} className={modalInputCls + " w-auto"}>
          <option value="all">All Types</option>
          {(Object.keys(TYPE_LABELS) as MainLedgerRowType[]).map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as LedgerCategory | "all")} className={modalInputCls + " w-auto"}>
          <option value="all">All Categories</option>
          {(Object.keys(CATEGORY_LABELS) as LedgerCategory[]).map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
        <select value={partyFilter} onChange={(e) => setPartyFilter(e.target.value)} className={modalInputCls + " w-auto"}>
          <option value="all">All Parties</option>
          {parties.map((p) => (
            <option key={`${p.partyType}:${p.partyId}`} value={`${p.partyType}:${p.partyId}`}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden overflow-x-auto">
        <div className="grid grid-cols-7 gap-2 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC] min-w-[720px]">
          <div>Date</div>
          <div>Ref</div>
          <div>Type</div>
          <div>Category</div>
          <div>Party</div>
          <div>Debit</div>
          <div>Credit</div>
        </div>
        {rows.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No entries match these filters</div>
        ) : (
          rows.map((r) => (
            <div key={r.key} className="grid grid-cols-7 gap-2 px-4 py-3 text-xs items-center border-b border-[#F0F2F4] last:border-0 min-w-[720px]">
              <div className="text-[#5B6773]">{new Date(r.date).toLocaleDateString()}</div>
              <div className="font-semibold text-[#1A2027]">{r.ref}</div>
              <div className="text-[#5B6773]">{TYPE_LABELS[r.type]}</div>
              <div className="text-[#5B6773]">{CATEGORY_LABELS[r.category]}</div>
              <div className="text-[#5B6773]">{r.partyName}</div>
              <div className={r.debit > 0 ? "font-semibold text-[#1A2027]" : "text-[#B0B8BF]"}>{r.debit > 0 ? fmt(r.debit) : "—"}</div>
              <div className={r.credit > 0 ? "font-semibold text-[#1F7A4D]" : "text-[#B0B8BF]"}>{r.credit > 0 ? fmt(r.credit) : "—"}</div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

function PayableTab({
  inputs,
  onOpenStatement,
  onPay,
}: {
  inputs: LedgerInputs;
  onOpenStatement: (partyType: PartyType, partyId: string) => void;
  onPay: (partyType: PartyType, partyId: string) => void;
}) {
  const owed = partySummaries(inputs)
    .filter((p) => p.balance > 0)
    .sort((a, b) => b.balance - a.balance);
  const total = owed.reduce((sum, p) => sum + p.balance, 0);

  return (
    <>
      <div className="font-heading font-bold text-base text-[#1A2027] mb-1">Accounts Payable</div>
      <div className="text-xs text-[#5B6773] mb-4">Amount owed to each B2B supplier, doctor, and courier, net of any payments already recorded.</div>
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden mb-4">
        <div className="grid grid-cols-4 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
          <div>Party</div>
          <div>Type</div>
          <div>Balance</div>
          <div></div>
        </div>
        {owed.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">Nothing owed right now</div>
        ) : (
          owed.map((p) => (
            <div key={`${p.partyType}-${p.partyId}`} className="grid grid-cols-4 px-4 py-3 text-xs items-center border-b border-[#F0F2F4] last:border-0">
              <button onClick={() => onOpenStatement(p.partyType, p.partyId)} className="font-semibold text-[#1A2027] text-left cursor-pointer hover:text-primary">
                {p.name}
              </button>
              <div className="text-[10px] font-bold text-[#B8860B] bg-[#FFF6E5] rounded-full px-2 py-0.5 w-fit">{PARTY_TYPE_LABELS[p.partyType]}</div>
              <div className="font-semibold text-[#7A56C8]">{fmt(p.balance)}</div>
              <button onClick={() => onPay(p.partyType, p.partyId)} className="text-[11px] font-bold text-primary cursor-pointer justify-self-end">
                Pay
              </button>
            </div>
          ))
        )}
      </div>
      <Stat label="Total Payable" value={fmt(total)} color="#7A56C8" />
    </>
  );
}

function AccountsTab({ inputs, onOpenStatement }: { inputs: LedgerInputs; onOpenStatement: (partyType: PartyType, partyId: string) => void }) {
  const parties = allParties(inputs);

  return (
    <>
      <div className="font-heading font-bold text-base text-[#1A2027] mb-1">Party Accounts</div>
      <div className="text-xs text-[#5B6773] mb-4">Every B2B supplier, doctor, and courier — open a party for its full statement.</div>
      {(["b2b", "doctor", "courier"] as PartyType[]).map((pt) => {
        const list = parties.filter((p) => p.partyType === pt);
        if (list.length === 0) return null;
        return (
          <div key={pt} className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden mb-4">
            <div className="px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">{PARTY_TYPE_LABELS[pt]}s</div>
            {list.map((p) => {
              const s = partySummary(inputs, p.partyType, p.partyId);
              return (
                <button
                  key={p.partyId}
                  onClick={() => onOpenStatement(p.partyType, p.partyId)}
                  className="w-full grid grid-cols-3 px-4 py-3 text-xs items-center border-b border-[#F0F2F4] last:border-0 cursor-pointer text-left hover:bg-[#F7F9FA]"
                >
                  <div className="font-semibold text-[#1A2027]">{p.name}</div>
                  <div className="text-[#5B6773]">Billed {fmt(s.totalBilled)}</div>
                  <div className="font-semibold" style={{ color: s.balance > 0 ? "#7A56C8" : "#1F7A4D" }}>
                    {s.balance > 0 ? `Owes ${fmt(s.balance)}` : "Settled"}
                  </div>
                </button>
              );
            })}
          </div>
        );
      })}
    </>
  );
}

function RefundsTab({ refunds, rangeStart }: { refunds: { id: string; orderId: string; clientName: string; amount: number; type: string; createdAt: number }[]; rangeStart: number }) {
  const rows = refunds.filter((r) => r.createdAt >= rangeStart).sort((a, b) => b.createdAt - a.createdAt);
  const total = rows.reduce((sum, r) => sum + r.amount, 0);

  return (
    <>
      <div className="font-heading font-bold text-base text-[#1A2027] mb-1">Refunds</div>
      <div className="text-xs text-[#5B6773] mb-4">Every refund issued from the order flow — the same records shown to admin when processing a refund.</div>
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden mb-4">
        <div className="grid grid-cols-4 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
          <div>Order</div>
          <div>Client</div>
          <div>Type</div>
          <div>Amount</div>
        </div>
        {rows.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No refunds in this range</div>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="grid grid-cols-4 px-4 py-3 text-xs items-center border-b border-[#F0F2F4] last:border-0">
              <div className="font-semibold text-[#1A2027]">{r.orderId}</div>
              <div>{r.clientName}</div>
              <div className="text-[#5B6773]">{r.type}</div>
              <div className="font-semibold text-[#D64545]">{fmt(r.amount)}</div>
            </div>
          ))
        )}
      </div>
      <Stat label="Total Refunded" value={fmt(total)} color="#D64545" />
    </>
  );
}

function CancellationsTab({
  orders,
  bookings,
  rangeStart,
}: {
  orders: { id: string; ownerName: string; total: number; status: string; createdAt: number; rejectReason?: string }[];
  bookings: { id: string; ownerName: string; amount: number; status: string; createdAt: number; rejectReason?: string }[];
  rangeStart: number;
}) {
  const cancelledOrders = orders.filter((o) => o.status === "Payment Rejected" && o.createdAt >= rangeStart);
  const cancelledBookings = bookings.filter((b) => (b.status === "Payment Rejected" || b.status === "Cancelled") && b.createdAt >= rangeStart);

  return (
    <>
      <div className="font-heading font-bold text-base text-[#1A2027] mb-1">Cancellations</div>
      <div className="text-xs text-[#5B6773] mb-4">Orders and consults that never converted to income — rejected payments or cancelled bookings.</div>
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden mb-4">
        <div className="grid grid-cols-4 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
          <div>Ref</div>
          <div>Client</div>
          <div>Reason</div>
          <div>Amount</div>
        </div>
        {cancelledOrders.length === 0 && cancelledBookings.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No cancellations in this range</div>
        ) : (
          <>
            {cancelledOrders.map((o) => (
              <div key={o.id} className="grid grid-cols-4 px-4 py-3 text-xs items-center border-b border-[#F0F2F4] last:border-0">
                <div className="font-semibold text-[#1A2027]">{o.id}</div>
                <div>{o.ownerName}</div>
                <div className="text-[#5B6773]">{o.rejectReason || "Payment rejected"}</div>
                <div className="font-semibold text-[#8A96A3]">{fmt(o.total)}</div>
              </div>
            ))}
            {cancelledBookings.map((b) => (
              <div key={b.id} className="grid grid-cols-4 px-4 py-3 text-xs items-center border-b border-[#F0F2F4] last:border-0">
                <div className="font-semibold text-[#1A2027]">{b.id}</div>
                <div>{b.ownerName}</div>
                <div className="text-[#5B6773]">{b.rejectReason || b.status}</div>
                <div className="font-semibold text-[#8A96A3]">{fmt(b.amount)}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}

function ReceivableTab({ inputs }: { inputs: LedgerInputs }) {
  const pendingOrders = inputs.orders.filter((o) => o.status === "Receipt Uploaded");
  const pendingBookings = inputs.bookings.filter((b) => b.status === "Payment Review");
  const total = receivableTotal(inputs);

  return (
    <>
      <div className="font-heading font-bold text-base text-[#1A2027] mb-1">Accounts Receivable</div>
      <div className="text-xs text-[#5B6773] mb-4">Payments submitted but not yet approved — nothing here counts as income until confirmed.</div>
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden mb-4">
        <div className="grid grid-cols-3 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
          <div>Ref</div>
          <div>Client</div>
          <div>Amount</div>
        </div>
        {pendingOrders.length === 0 && pendingBookings.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">Nothing pending approval</div>
        ) : (
          <>
            {pendingOrders.map((o) => (
              <div key={o.id} className="grid grid-cols-3 px-4 py-3 text-xs items-center border-b border-[#F0F2F4] last:border-0">
                <div className="font-semibold text-[#1A2027]">{o.id}</div>
                <div>{o.ownerName}</div>
                <div className="font-semibold text-[#C9962B]">{fmt(o.total)}</div>
              </div>
            ))}
            {pendingBookings.map((b) => (
              <div key={b.id} className="grid grid-cols-3 px-4 py-3 text-xs items-center border-b border-[#F0F2F4] last:border-0">
                <div className="font-semibold text-[#1A2027]">{b.id}</div>
                <div>{b.ownerName}</div>
                <div className="font-semibold text-[#C9962B]">{fmt(b.amount)}</div>
              </div>
            ))}
          </>
        )}
      </div>
      <Stat label="Total Receivable" value={fmt(total)} color="#C9962B" />
    </>
  );
}

function AuditLogTab({
  payments,
  rangeStart,
  inputs,
}: {
  payments: {
    id: string;
    partyType: PartyType;
    partyId: string;
    amount: number;
    paymentDate: string;
    method: PaymentMethod;
    reference: string;
    notes: string;
    linkedRefs: string[];
    createdAt: number;
  }[];
  rangeStart: number;
  inputs: LedgerInputs;
}) {
  const rows = payments.filter((p) => p.createdAt >= rangeStart).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <>
      <div className="font-heading font-bold text-base text-[#1A2027] mb-1">Audit Log</div>
      <div className="text-xs text-[#5B6773] mb-4">Every payout recorded, in the order it was made.</div>
      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden overflow-x-auto">
        <div className="grid grid-cols-6 gap-2 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC] min-w-[760px]">
          <div>Date</div>
          <div>Party</div>
          <div>Method</div>
          <div>Reference</div>
          <div>For</div>
          <div>Amount</div>
        </div>
        {rows.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No payments recorded in this range</div>
        ) : (
          rows.map((p) => {
            const name = allParties(inputs).find((party) => party.partyType === p.partyType && party.partyId === p.partyId)?.name ?? p.partyId;
            return (
              <div key={p.id} className="grid grid-cols-6 gap-2 px-4 py-3 text-xs items-center border-b border-[#F0F2F4] last:border-0 min-w-[760px]">
                <div>{p.paymentDate}</div>
                <div className="font-semibold text-[#1A2027]">{name}</div>
                <div className="text-[#5B6773]">{PAYMENT_METHOD_LABELS[p.method]}</div>
                <div className="text-[#5B6773]">{p.reference || "—"}</div>
                <div className="text-[#5B6773] truncate" title={p.linkedRefs.length ? p.linkedRefs.join(", ") : p.notes}>
                  {p.linkedRefs.length ? p.linkedRefs.join(", ") : p.notes ? `(${p.notes})` : "Advance"}
                </div>
                <div className="font-semibold text-[#1F7A4D]">{fmt(p.amount)}</div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

function PartyStatementView({
  inputs,
  partyType,
  partyId,
  rangeStart,
  onBack,
  onRecordPayment,
}: {
  inputs: LedgerInputs;
  partyType: PartyType;
  partyId: string;
  rangeStart: number;
  onBack: () => void;
  onRecordPayment: () => void;
}) {
  const summary = partySummary(inputs, partyType, partyId);
  const rows = partyVoucherRows(inputs, partyType, partyId).filter((r) => r.date >= rangeStart);

  return (
    <div>
      <button onClick={onBack} className="text-[13px] text-primary font-semibold mb-4 cursor-pointer">
        ← Back to Accounts
      </button>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="font-heading font-bold text-lg text-[#1A2027]">{summary.name}</div>
          <div className="text-[11px] text-[#8A96A3] font-semibold">{PARTY_TYPE_LABELS[partyType]}</div>
        </div>
        <button onClick={onRecordPayment} className="bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-lg cursor-pointer">
          Record Payment
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
        <Stat label="Total Billed" value={fmt(summary.totalBilled)} color="#1A2027" />
        <Stat label="Total Paid" value={fmt(summary.totalPaid)} color="#1F7A4D" />
        <Stat label="Balance Payable" value={fmt(summary.balance)} color="#7A56C8" />
      </div>

      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
        <div className="grid grid-cols-6 px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
          <div className="col-span-2">Particulars</div>
          <div>Vch Type</div>
          <div>Vch No.</div>
          <div>Debit</div>
          <div>Balance</div>
        </div>
        <div className="grid grid-cols-6 px-4 py-2.5 text-xs items-center border-b border-[#F0F2F4] bg-[#F7F9FA]">
          <div className="col-span-5 font-semibold text-[#1A2027]">Opening Balance</div>
          <div className="font-semibold">{fmt(0)}</div>
        </div>
        {rows.length === 0 ? (
          <div className="px-4 py-5 text-xs text-[#8A96A3] text-center">No activity in this range</div>
        ) : (
          rows.map((r) => (
            <div key={r.key} className="grid grid-cols-6 px-4 py-3 text-xs items-center border-b border-[#F0F2F4] last:border-0">
              <div className="col-span-2 text-[#3A4652]">{r.particulars}</div>
              <div className="text-[#5B6773]">{r.vchType}</div>
              <div className="text-[#5B6773]">{r.vchNo}</div>
              <div className={r.debit > 0 ? "font-semibold text-[#1F7A4D]" : "text-[#B0B8BF]"}>{r.debit > 0 ? fmt(r.debit) : "—"}</div>
              <div className="font-semibold text-[#1A2027]">{fmt(r.balance)}</div>
            </div>
          ))
        )}
        <div className="grid grid-cols-6 px-4 py-2.5 text-xs items-center bg-[#F7F9FA]">
          <div className="col-span-5 font-semibold text-[#1A2027]">Closing Balance</div>
          <div className="font-bold text-[#7A56C8]">{fmt(rows.length ? rows[rows.length - 1].balance : 0)}</div>
        </div>
      </div>
    </div>
  );
}

function PaymentModal({
  inputs,
  initial,
  saveError,
  onCancel,
  onSubmit,
}: {
  inputs: LedgerInputs;
  initial: { partyType: PartyType; partyId: string };
  saveError: string | null;
  onCancel: () => void;
  onSubmit: (input: {
    partyType: PartyType;
    partyId: string;
    amount: number;
    paymentDate: string;
    method: PaymentMethod;
    reference: string;
    notes: string;
    receiptPhoto: string;
    linkedRefs: string[];
  }) => void;
}) {
  const [partyType, setPartyType] = useState<PartyType>(initial.partyType);
  const [partyId, setPartyId] = useState(initial.partyId);
  const summary = partySummary(inputs, partyType, partyId);
  const invoiceRows = partyVoucherRows(inputs, partyType, partyId).filter((r) => r.credit > 0);
  const [selectedRefs, setSelectedRefs] = useState<Set<string>>(new Set());
  const [amount, setAmount] = useState(Math.max(0, summary.balance));
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState<PaymentMethod>("bank_transfer");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [receiptPhoto, setReceiptPhoto] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const partiesOfType = allParties(inputs).filter((p) => p.partyType === partyType);
  const selectedTotal = invoiceRows.filter((r) => selectedRefs.has(r.vchNo)).reduce((sum, r) => sum + r.credit, 0);
  const isExtraPayment = selectedRefs.size === 0 ? amount > 0 : amount !== selectedTotal;

  const switchParty = (nextType: PartyType, nextId: string) => {
    setPartyType(nextType);
    setPartyId(nextId);
    setSelectedRefs(new Set());
    setAmount(Math.max(0, partySummary(inputs, nextType, nextId).balance));
  };

  const toggleRef = (vchNo: string, creditAmount: number) => {
    const next = new Set(selectedRefs);
    if (next.has(vchNo)) next.delete(vchNo);
    else next.add(vchNo);
    setSelectedRefs(next);
    const total = invoiceRows.filter((r) => next.has(r.vchNo)).reduce((sum, r) => sum + r.credit, 0);
    setAmount(total || creditAmount);
  };

  const handleReceipt = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    if (!isAllowedImageFile(file)) {
      setError("Please choose an image file (JPEG, PNG, GIF, SVG, TIFF, or RAW).");
      return;
    }
    setUploading(true);
    try {
      setReceiptPhoto(await resizeImageFile(file, 1000, 1400));
    } catch {
      setError("Could not process that image — try a different file.");
    } finally {
      setUploading(false);
    }
  };

  const submit = () => {
    if (!(amount > 0)) {
      setError("Enter a valid amount.");
      return;
    }
    if (!receiptPhoto) {
      setError("Please upload the payment receipt.");
      return;
    }
    onSubmit({
      partyType,
      partyId,
      amount,
      paymentDate,
      method,
      reference: reference.trim(),
      notes: notes.trim(),
      receiptPhoto,
      linkedRefs: Array.from(selectedRefs),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={onCancel}>
      <div className="bg-white rounded-xl p-5 w-full max-w-[460px] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="text-sm font-bold text-[#1A2027] mb-4">Record Payment</div>

        <div className="grid grid-cols-2 gap-2 mb-2.5">
          <ModalField label="Party Type">
            <select
              value={partyType}
              onChange={(e) => {
                const next = e.target.value as PartyType;
                switchParty(next, allParties(inputs).find((p) => p.partyType === next)?.partyId ?? "");
              }}
              className={modalInputCls}
            >
              {(["b2b", "doctor", "courier"] as PartyType[]).map((pt) => (
                <option key={pt} value={pt}>
                  {PARTY_TYPE_LABELS[pt]}
                </option>
              ))}
            </select>
          </ModalField>
          <ModalField label="Party">
            <select value={partyId} onChange={(e) => switchParty(partyType, e.target.value)} className={modalInputCls}>
              {partiesOfType.map((p) => (
                <option key={p.partyId} value={p.partyId}>
                  {p.name}
                </option>
              ))}
            </select>
          </ModalField>
        </div>

        <div className="text-[11px] text-[#5B6773] mb-3">
          Outstanding balance: <span className="font-bold text-[#7A56C8]">{fmt(summary.balance)}</span>
        </div>

        <div className="text-[11px] font-semibold text-[#5B6773] mb-1.5">Outstanding Orders / Invoices</div>
        <div className="border border-[#E4E9EC] rounded-lg overflow-hidden mb-3 max-h-[180px] overflow-y-auto">
          {invoiceRows.length === 0 ? (
            <div className="px-3 py-3 text-[11px] text-[#8A96A3] text-center">Nothing outstanding for this party</div>
          ) : (
            invoiceRows.map((r) => (
              <label key={r.key} className="flex items-center gap-2.5 px-3 py-2 text-xs border-b border-[#F0F2F4] last:border-0 cursor-pointer hover:bg-[#F7F9FA]">
                <input type="checkbox" checked={selectedRefs.has(r.vchNo)} onChange={() => toggleRef(r.vchNo, r.credit)} />
                <span className="font-semibold text-[#1A2027] shrink-0">{r.vchNo}</span>
                <span className="text-[#5B6773] flex-1 truncate">{r.particulars}</span>
                <span className="font-semibold text-[#7A56C8] shrink-0">{fmt(r.credit)}</span>
              </label>
            ))
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2.5">
          <ModalField label="Amount (Rs.)">
            <input value={String(amount)} onChange={(e) => setAmount(Number(e.target.value.replace(/[^\d]/g, "")) || 0)} className={modalInputCls} />
          </ModalField>
          <ModalField label="Payment Date">
            <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className={modalInputCls} />
          </ModalField>
        </div>
        {isExtraPayment && (
          <div className="text-[11px] text-[#C9962B] mb-2.5">
            {selectedRefs.size === 0
              ? "Not tied to a specific invoice — this will be recorded as a flexible/advance payment. Consider adding a note."
              : "Amount doesn't match the selected invoices — consider adding a note explaining the difference."}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mb-2.5">
          <ModalField label="Method">
            <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} className={modalInputCls}>
              {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((m) => (
                <option key={m} value={m}>
                  {PAYMENT_METHOD_LABELS[m]}
                </option>
              ))}
            </select>
          </ModalField>
          <ModalField label="Reference / Txn ID">
            <input value={reference} onChange={(e) => setReference(e.target.value)} className={modalInputCls} />
          </ModalField>
        </div>

        <ModalField label="Notes / Remarks">
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., advance payment, adjustment, extra fee" className={modalInputCls} />
        </ModalField>
        <div className="h-2.5" />
        <ModalField label="Payment Screenshot (required)">
          <input type="file" accept={IMAGE_ACCEPT} onChange={(e) => handleReceipt(e.target.files?.[0])} className="text-[11px]" />
        </ModalField>
        {uploading && <div className="text-[11px] text-[#8A96A3] mt-1">Processing photo…</div>}
        {receiptPhoto && !uploading && <div className="text-[11px] text-[#1F7A4D] font-semibold mt-1">✓ Screenshot attached</div>}
        {(error || saveError) && <div className="text-[11px] text-[#D64545] mt-2">{error || saveError}</div>}

        <div className="flex gap-2 mt-4">
          <button onClick={onCancel} className="flex-1 border border-[#E4E9EC] text-[#3A4652] text-xs font-semibold py-2 rounded-lg cursor-pointer">
            Cancel
          </button>
          <button onClick={submit} className="flex-1 bg-primary text-white text-xs font-semibold py-2 rounded-lg cursor-pointer">
            Record Payment
          </button>
        </div>
      </div>
    </div>
  );
}

const modalInputCls = "w-full box-border h-9 rounded-md border border-[#E4E9EC] px-2.5 text-xs bg-white";

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11px] font-semibold text-[#5B6773] mb-1">{label}</div>
      {children}
    </label>
  );
}
