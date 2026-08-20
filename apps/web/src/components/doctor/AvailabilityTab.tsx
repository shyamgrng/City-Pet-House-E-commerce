"use client";

import { useState } from "react";
import { useVet } from "@/context/VetContext";
import { AVAILABILITY_SLOTS, next14Days } from "@/lib/vet-types";

export default function AvailabilityTab({ doctorId }: { doctorId: string }) {
  const { availability, toggleAvailabilitySlot } = useVet();
  const [saved, setSaved] = useState(false);
  const days = next14Days();
  const forDoctor = availability[doctorId] ?? {};

  const update = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="text-[13px] font-bold text-[#1A2027] mb-1">14-Day Availability</div>
      <div className="text-xs text-[#8A96A3] mb-4">
        Tap a time slot to open/close it — clients can book consults at open slots · available 24/7
      </div>
      <div className="flex gap-4 mb-3.5 text-[11px] text-[#5B6773]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ background: "#F2C94C" }} />
          Available
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-white border border-[#C7CDD3]" />
          Not Available
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {days.map((day) => {
          const openTimes = forDoctor[day] ?? [];
          return (
            <div key={day} className="border border-[#E4E9EC] rounded-[10px] px-4 py-3">
              <div className="text-xs font-bold text-[#1A2027] mb-2">{day}</div>
              <div className="flex gap-1.5 flex-wrap">
                {AVAILABILITY_SLOTS.map((slot) => {
                  const open = openTimes.includes(slot);
                  return (
                    <button
                      key={slot}
                      onClick={() => toggleAvailabilitySlot(doctorId, day, slot)}
                      className="rounded-md px-2.5 py-1.5 text-[11px] font-semibold cursor-pointer"
                      style={{
                        background: open ? "#F2C94C" : "#fff",
                        color: open ? "#1A2027" : "#5B6773",
                        border: `1px solid ${open ? "#F2C94C" : "#E4E9EC"}`,
                      }}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={update} className="bg-primary text-white px-[22px] py-2.5 rounded-[9px] text-[13px] font-semibold cursor-pointer mt-[18px]">
        Update
      </button>
      {saved && <div className="text-[11px] text-[#1F7A4D] mt-2">✓ Availability updated — now live on the website and mobile apps</div>}
    </div>
  );
}
