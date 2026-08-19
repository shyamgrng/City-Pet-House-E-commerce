"use client";

import { useState } from "react";
import {
  categoryShare,
  lowStockAndOut,
  stockByCategory,
  stockSummary,
  unitsByCategory,
} from "@/lib/admin-data";

const subTabs = ["Overview", "Product", "Category Setting", "Brand Setting", "Delivery Setting", "Setting"];

export default function ShopPage() {
  const [tab, setTab] = useState("Overview");

  const gradientStops = categoryShare
    .reduce<{ start: number; stops: string[] }>(
      (acc, c) => {
        const end = acc.start + c.pct;
        acc.stops.push(`${c.color} ${acc.start}% ${end}%`);
        return { start: end, stops: acc.stops };
      },
      { start: 0, stops: [] }
    )
    .stops.join(", ");

  return (
    <div>
      <div className="flex gap-2 mb-5 flex-wrap">
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

      {tab !== "Overview" && (
        <div className="bg-white border border-dashed border-[#E4E9EC] rounded-[10px] p-8 text-center text-xs text-[#8A96A3]">
          {tab} — coming soon
        </div>
      )}

      {tab === "Overview" && (
        <>
          <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-4">Stock Dashboard</div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-4">
            <StatCard label="Total SKUs" value={stockSummary.totalSkus} />
            <StatCard label="Total Units in Stock" value={stockSummary.totalUnits} color="#1996C8" />
            <StatCard label="Low Stock Items" value={stockSummary.lowStock} color="#C9962B" />
            <StatCard label="Out of Stock" value={stockSummary.outOfStock} color="#D64545" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-3.5 mb-4">
            <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-5">
              <div className="text-[13px] font-bold text-[#1A2027] mb-4">Units in Stock by Category</div>
              {unitsByCategory.map((c) => {
                const max = Math.max(...unitsByCategory.map((u) => u.units));
                return (
                  <div key={c.label} className="mb-3.5 last:mb-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-[#1A2027]">{c.label}</span>
                      <span className="text-[#5B6773]">{c.units} units</span>
                    </div>
                    <div className="h-1.5 bg-[#EEF1F3] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(c.units / max) * 100}%`, background: c.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-5">
              <div className="text-[13px] font-bold text-[#1A2027] mb-4">Category Share</div>
              <div
                className="w-36 h-36 rounded-full mx-auto mb-4"
                style={{ background: `conic-gradient(${gradientStops})` }}
              />
              {categoryShare.map((c) => (
                <div key={c.label} className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                    <span className="text-[#3A4652]">{c.label}</span>
                  </div>
                  <span className="font-semibold">{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-5 mb-4">
            <div className="text-[13px] font-bold text-[#1A2027]">Low Stock &amp; Out of Stock</div>
            <div className="text-[11px] text-[#8A96A3] mb-3">Items at or below their reorder threshold</div>
            {lowStockAndOut.map((it) => (
              <div key={it.name} className="flex justify-between py-2 border-b border-[#F0F2F4] text-xs last:border-0">
                <span className="font-semibold text-[#1A2027]">{it.name}</span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={
                    it.level === "out"
                      ? { background: "#FCEAEA", color: "#D64545" }
                      : { background: "#FBF1DD", color: "#C9962B" }
                  }
                >
                  {it.status}
                </span>
              </div>
            ))}
          </div>

          {Object.entries(stockByCategory).map(([cat, items]) => (
            <div key={cat} className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-[13px] font-bold text-[#1A2027]">{cat}</div>
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm cursor-pointer">+</div>
              </div>
              <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
                {items.map((p) => (
                  <div key={p.name} className="grid grid-cols-3 px-4 py-3 text-xs items-center border-b border-[#F0F2F4] last:border-0">
                    <div className="font-medium text-[#1A2027]">{p.name}</div>
                    <div className="text-[#5B6773]">{p.qty}</div>
                    <div
                      className="font-semibold"
                      style={{ color: p.status === "In Stock" ? "#1F7A4D" : p.status === "Low Stock" ? "#C9962B" : "#D64545" }}
                    >
                      {p.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-4">
      <div className="text-[11px] text-[#8A96A3] font-semibold mb-2">{label}</div>
      <div className="font-heading font-bold text-xl" style={{ color: color || "#1A2027" }}>
        {value}
      </div>
    </div>
  );
}
