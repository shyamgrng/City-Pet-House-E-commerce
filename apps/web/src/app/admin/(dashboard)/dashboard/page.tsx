import {
  dashboardStatCards,
  liveStatusCards,
  lowStockItems,
  pendingJobsBySection,
  recentActivity,
  weeklyInteractions,
  weeklyInteractionsTotal,
  weeklyOrders,
  weeklyOrdersTotal,
} from "@/lib/admin-data";

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-[18px]">Dashboard</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
        {liveStatusCards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl px-5 py-[18px] flex items-center justify-between"
            style={{ background: c.bg, border: `1px solid ${c.border}` }}
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: c.dot }} />
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: c.color }}>
                  {c.label}
                </span>
              </div>
              <div className="font-heading font-bold text-[30px]" style={{ color: c.color }}>
                {c.value}
              </div>
            </div>
            <div className="text-xs font-semibold" style={{ color: c.color }}>
              View →
            </div>
          </div>
        ))}
      </div>

      <div className="text-[13px] font-bold text-[#1A2027] my-2">Pending Jobs — by Section</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-5">
        {pendingJobsBySection.map((s) => (
          <div key={s.label} className="bg-white border border-[#E4E9EC] rounded-[10px] p-4">
            <div className="text-[11px] text-[#8A96A3] font-semibold mb-2">{s.label}</div>
            <div className="flex items-baseline gap-2">
              <div className="font-heading font-bold text-xl" style={{ color: s.color }}>
                {s.value}
              </div>
              <div className="text-[11px] text-[#8A96A3]">pending</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-3.5">
        {dashboardStatCards.map((c) => (
          <div key={c.label} className="bg-white border border-[#E4E9EC] rounded-[10px] p-4">
            <div className="text-[11px] text-[#8A96A3] font-semibold mb-2">{c.label}</div>
            <div className="font-heading font-bold text-xl text-[#1A2027]">{c.value}</div>
          </div>
        ))}
      </div>

      <BarPanel title="Orders Received — Last 7 Days" subtitle={`${weeklyOrdersTotal} orders this week`} data={weeklyOrders} peak={21} activeColor="#1996C8" baseColor="#CFE6F1" />
      <BarPanel
        title="Client Interactions — Last 7 Days"
        subtitle={`Site chats, contact-form requests & call-backs · ${weeklyInteractionsTotal} this week`}
        data={weeklyInteractions}
        peak={34}
        activeColor="#1F7A4D"
        baseColor="#D8ECE1"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-[18px]">
          <div className="text-[13px] font-bold text-[#1A2027] mb-3">Low Stock Alerts</div>
          {lowStockItems.map((it) => (
            <div key={it.name} className="flex justify-between py-2 border-b border-[#EEF1F3] text-xs last:border-0">
              <span className="text-[#3A4652]">{it.name}</span>
              <span className="font-bold text-[#D64545]">{it.stock} left</span>
            </div>
          ))}
        </div>
        <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-[18px]">
          <div className="text-[13px] font-bold text-[#1A2027] mb-3">Recent Activity</div>
          {recentActivity.map((a) => (
            <div key={a.text} className="py-2 border-b border-[#EEF1F3] text-xs text-[#3A4652] last:border-0">
              <span className="font-semibold">{a.text}</span>
              <div className="text-[10px] text-[#8A96A3] mt-0.5">{a.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BarPanel({
  title,
  subtitle,
  data,
  peak,
  activeColor,
  baseColor,
}: {
  title: string;
  subtitle: string;
  data: { label: string; count: number }[];
  peak: number;
  activeColor: string;
  baseColor: string;
}) {
  return (
    <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-5 mb-3.5">
      <div className="text-[13px] font-bold text-[#1A2027] mb-0.5">{title}</div>
      <div className="text-[11px] text-[#8A96A3] mb-[18px]">{subtitle}</div>
      <div className="flex items-end gap-4 h-40 px-1">
        {data.map((d) => (
          <div key={d.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <div className="text-[11px] font-bold text-[#1A2027]">{d.count}</div>
            <div
              className="w-full max-w-[36px] rounded-t-md"
              style={{ height: `${Math.round((d.count / peak) * 120)}px`, background: d.label === "Sat" ? activeColor : baseColor }}
            />
            <div className="text-[10px] text-[#8A96A3]">{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
