import { microchipRecords } from "@/lib/admin-data";

export default function MicrochippingRecordsPage() {
  return (
    <div>
      <div className="flex justify-between items-start mb-1">
        <div className="font-heading font-bold text-[19px] text-[#1A2027]">Microchipping Records</div>
        <button className="border border-[#7A56C8] text-[#7A56C8] text-xs font-semibold px-4 py-2.5 rounded-lg cursor-pointer">
          + Add New Chip
        </button>
      </div>
      <div className="text-xs text-[#5B6773] mb-4">
        Records entered here are matched when an authorized user looks up a microchip number on the public Microchipping Archive page.
      </div>

      <div className="flex items-center gap-3 mb-4">
        <input placeholder="Search chip number, pet name, owner…" className="flex-1 border border-[#E4E9EC] rounded-lg px-3.5 py-2.5 text-[13px]" />
        <div className="text-xs text-[#8A96A3] shrink-0">{microchipRecords.length} chipped animals</div>
      </div>

      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
        <div className="grid grid-cols-[0.6fr_1.6fr_1.4fr_1.6fr_1.4fr_1fr] px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
          <div>Photo</div>
          <div>Chip No. / Pet</div>
          <div>Breed / Color</div>
          <div>Owner / Phone</div>
          <div>Location</div>
          <div>Actions</div>
        </div>
        {microchipRecords.map((r) => (
          <div key={r.chip} className="grid grid-cols-[0.6fr_1.6fr_1.4fr_1.6fr_1.4fr_1fr] px-4 py-3 text-xs items-center border-b border-[#F0F2F4] last:border-0">
            <div className="w-9 h-9 rounded-full bg-[#EEF1F3]" />
            <div>
              <div className="font-bold text-[#7A56C8]">{r.chip}</div>
              <div className="text-[#8A96A3]">{r.pet}</div>
            </div>
            <div>
              <div className="text-[#1A2027]">{r.breed}</div>
              <div className="text-[#8A96A3]">{r.color}</div>
            </div>
            <div>
              <div className="text-[#1A2027]">{r.owner}</div>
              <div className="text-[#8A96A3]">{r.phone}</div>
            </div>
            <div className="text-[#3A4652]">{r.location}</div>
            <div className="flex gap-2">
              <button className="border border-[#7A56C8] text-[#7A56C8] text-[11px] font-semibold px-2.5 py-1 rounded cursor-pointer">Edit</button>
              <button className="border border-[#D64545] text-[#D64545] text-[11px] font-semibold px-2.5 py-1 rounded cursor-pointer">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
