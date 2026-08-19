"use client";

import { useState } from "react";
import { notificationTabs, notifRecentActivity, notifStats, notifTopCampaigns } from "@/lib/admin-data";

export default function NotificationsPage() {
  const [tab, setTab] = useState("dashboard");

  return (
    <div>
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-4">Notification Center</div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {notificationTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5"
            style={{ background: tab === t.key ? "#1996C8" : "#fff", color: tab === t.key ? "#fff" : "#3A4652", border: tab === t.key ? "none" : "1px solid #E4E9EC" }}
          >
            <span>{t.label}</span>
            {t.badge > 0 && (
              <span className="min-w-[16px] h-4 px-1 rounded-full bg-[#D64545] text-white text-[10px] font-bold flex items-center justify-center">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab !== "dashboard" ? (
        <div className="bg-white border border-dashed border-[#E4E9EC] rounded-[10px] p-8 text-center text-xs text-[#8A96A3]">
          {notificationTabs.find((t) => t.key === tab)?.label} — coming soon
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mb-3.5">
            {notifStats.map((s) => (
              <div key={s.label} className="bg-white border border-[#E4E9EC] rounded-[10px] p-4">
                <div className="text-[11px] text-[#8A96A3] font-semibold mb-2">{s.label}</div>
                <div className="font-heading font-bold text-xl text-[#1A2027]">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-3.5">
            <div>
              <div className="text-[13px] font-bold text-[#1A2027] mb-2">Recent Activity</div>
              <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
                {notifRecentActivity.map((a) => (
                  <div key={a.title} className="px-4 py-3 border-b border-[#F0F2F4] last:border-0">
                    <div className="font-bold text-xs text-[#1A2027]">{a.title}</div>
                    <div className="text-[11px] text-[#8A96A3] mt-0.5">{a.meta}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#1A2027] mb-2">Top Performing Campaigns</div>
              <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
                {notifTopCampaigns.map((c) => (
                  <div key={c.name} className="px-4 py-3 flex justify-between items-center text-xs">
                    <span className="font-bold text-[#1A2027]">{c.name}</span>
                    <span className="text-[#5B6773]">{c.stat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
