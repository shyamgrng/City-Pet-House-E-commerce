import { petTagRecords } from "@/lib/admin-data";

export default function PetTagArchivePage() {
  return (
    <div>
      <div className="flex justify-between items-start mb-1">
        <div className="font-heading font-bold text-[19px] text-[#1A2027]">Pet QR Tags</div>
        <button className="border border-primary text-primary text-xs font-semibold px-4 py-2.5 rounded-lg cursor-pointer">
          + Add New Pet
        </button>
      </div>
      <div className="text-xs text-[#5B6773] mb-4">
        QR tags placed on pet collars link back to this record — scanning one shows the pet &amp; owner details on the public Pet Tag Archive page.
      </div>

      <div className="flex items-center gap-3 mb-4">
        <input placeholder="Search pets, owners, microchip…" className="flex-1 border border-[#E4E9EC] rounded-lg px-3.5 py-2.5 text-[13px]" />
        <div className="text-xs text-[#8A96A3] shrink-0">{petTagRecords.length} pets</div>
      </div>

      <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
        <div className="grid grid-cols-[0.6fr_1.4fr_1.4fr_1.6fr_0.6fr_0.8fr_1fr] px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
          <div>Photo</div>
          <div>Pet Name</div>
          <div>Breed / Color</div>
          <div>Owner / Phone</div>
          <div>Scans</div>
          <div>QR</div>
          <div>Actions</div>
        </div>
        {petTagRecords.map((p) => (
          <div key={p.tag} className="grid grid-cols-[0.6fr_1.4fr_1.4fr_1.6fr_0.6fr_0.8fr_1fr] px-4 py-3 text-xs items-center border-b border-[#F0F2F4] last:border-0">
            <div className="w-9 h-9 rounded-full bg-[#EEF1F3]" />
            <div>
              <div className="font-bold text-[#1A2027]">{p.name}</div>
              <div className="text-[#8A96A3]">{p.info}</div>
              <div className="text-primary font-semibold">{p.tag}</div>
            </div>
            <div>
              <div className="text-[#1A2027]">{p.breed}</div>
              <div className="text-[#8A96A3]">{p.color}</div>
            </div>
            <div>
              <div className="text-[#1A2027]">{p.owner}</div>
              <div className="text-[#8A96A3]">{p.phone}</div>
            </div>
            <div>{p.scans}</div>
            <div>
              <button className="border border-primary text-primary text-[11px] font-semibold px-2 py-1 rounded cursor-pointer">↓ PNG</button>
            </div>
            <div className="flex gap-2">
              <button className="border border-primary text-primary text-[11px] font-semibold px-2.5 py-1 rounded cursor-pointer">Edit</button>
              <button className="border border-[#D64545] text-[#D64545] text-[11px] font-semibold px-2.5 py-1 rounded cursor-pointer">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
