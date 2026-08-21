"use client";

import { useState } from "react";
import AdoptionFormModal from "@/components/admin/AdoptionFormModal";
import PetFormModal from "@/components/admin/PetFormModal";
import MediaSlot from "@/components/MediaSlot";
import { useAdoption } from "@/context/AdoptionContext";
import { usePets } from "@/context/PetContext";
import { daysLeft, type AdoptionPost } from "@/lib/adoption-types";
import { formatRs, petSpeciesList, type Pet } from "@/lib/pet-types";

const CATEGORY_COLORS: Record<string, string> = {
  Dog: "#1996C8",
  Cat: "#C9962B",
  "Small Pets": "#7A56C8",
  Birds: "#1F7A4D",
  Fish: "#17A2A0",
};

const STATUS_COLORS: Record<string, string> = {
  Available: "#1F7A4D",
  Reserved: "#C9962B",
  Sold: "#8A96A3",
};

export default function PetAvailablePage() {
  const { pets, addPet, updatePet, deletePet } = usePets();
  const { posts, addPost, updatePost, deletePost } = useAdoption();
  const [tab, setTab] = useState("Overview");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Pet | null>(null);
  const [adoptionModalOpen, setAdoptionModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<AdoptionPost | null>(null);

  const total = pets.length;
  const available = pets.filter((p) => p.status === "Available").length;
  const reserved = pets.filter((p) => p.status === "Reserved").length;
  const sold = pets.filter((p) => p.status === "Sold").length;

  const bySpecies = petSpeciesList.map((s) => ({ label: s, count: pets.filter((p) => p.species === s).length, color: CATEGORY_COLORS[s] }));

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (p: Pet) => {
    setEditing(p);
    setModalOpen(true);
  };
  const handleSave = (draft: Omit<Pet, "id">) => {
    if (editing) updatePet(editing.id, draft);
    else addPet(draft);
    setModalOpen(false);
  };
  const markSold = (p: Pet) => updatePet(p.id, { ...p, status: p.status === "Sold" ? "Available" : "Sold" });

  const openAddPost = () => {
    setEditingPost(null);
    setAdoptionModalOpen(true);
  };
  const openEditPost = (p: AdoptionPost) => {
    setEditingPost(p);
    setAdoptionModalOpen(true);
  };
  const handleSavePost = (draft: Omit<AdoptionPost, "id">) => {
    if (editingPost) updatePost(editingPost.id, draft);
    else addPost(draft);
    setAdoptionModalOpen(false);
  };
  const toggleAdopted = (p: AdoptionPost) => updatePost(p.id, { ...p, adopted: !p.adopted });

  return (
    <div>
      <div className="flex justify-between items-start mb-1">
        <div>
          <div className="font-heading font-bold text-[19px] text-[#1A2027]">Pet Available</div>
          <div className="text-xs text-[#5B6773]">Manage the puppies, kittens &amp; other pets shown in Pets Available for Sale.</div>
        </div>
        {tab === "Manage Pets" && (
          <button onClick={openAdd} className="bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-lg cursor-pointer whitespace-nowrap">
            + Add Pet
          </button>
        )}
        {tab === "Adoption Posts" && (
          <button onClick={openAddPost} className="bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-lg cursor-pointer whitespace-nowrap">
            + Add Notice
          </button>
        )}
      </div>

      <div className="flex gap-2 my-5">
        {["Overview", "Manage Pets", "Adoption Posts"].map((t) => (
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

      {tab === "Manage Pets" && (
        <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_0.9fr] px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
            <div>Pet</div>
            <div>Species</div>
            <div>Price</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          {pets.length === 0 ? (
            <div className="px-4 py-6 text-xs text-[#8A96A3] text-center">No pets yet.</div>
          ) : (
            pets.map((p) => (
              <div key={p.id} className="grid grid-cols-[1.4fr_1fr_1fr_1fr_0.9fr] px-4 py-3 text-xs items-center border-b border-[#F0F2F4] last:border-0">
                <div>
                  <div className="font-semibold text-[#1A2027]">{p.breed}</div>
                  <div className="text-[11px] text-[#8A96A3] mt-0.5">
                    {p.sex} · {p.age}
                  </div>
                </div>
                <div className="text-[#5B6773]">{p.species}</div>
                <div className="font-semibold">{formatRs(p.price)}</div>
                <div className="text-[11px] font-semibold" style={{ color: STATUS_COLORS[p.status] }}>
                  {p.status}
                </div>
                <div className="flex gap-2.5 text-[11px] font-semibold">
                  <span onClick={() => openEdit(p)} className="text-primary cursor-pointer">
                    Edit
                  </span>
                  <span onClick={() => deletePet(p.id)} className="text-[#D64545] cursor-pointer">
                    Delete
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "Adoption Posts" && (
        <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
          <div className="grid grid-cols-[1.2fr_1fr_0.9fr_0.9fr_1fr] px-4 py-2.5 text-[11px] font-bold text-[#8A96A3] uppercase border-b border-[#E4E9EC]">
            <div>Dog</div>
            <div>Contact</div>
            <div>Days Left</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          {posts.length === 0 ? (
            <div className="px-4 py-6 text-xs text-[#8A96A3] text-center">No adoption notices yet.</div>
          ) : (
            posts.map((p) => (
              <div key={p.id} className="grid grid-cols-[1.2fr_1fr_0.9fr_0.9fr_1fr] px-4 py-3 text-xs items-center border-b border-[#F0F2F4] last:border-0">
                <div>
                  <div className="font-semibold text-[#1A2027]">
                    {p.name} · {p.breed}
                  </div>
                  <div className="text-[11px] text-[#8A96A3] mt-0.5">
                    {p.sex} · {p.age}
                  </div>
                </div>
                <div className="text-[#5B6773]">{p.contact}</div>
                <div className="font-semibold">{daysLeft(p)} days</div>
                <div className="text-[11px] font-semibold" style={{ color: p.adopted ? "#1F7A4D" : "#C9962B" }}>
                  {p.adopted ? "Adopted" : "Active"}
                </div>
                <div className="flex gap-2.5 text-[11px] font-semibold">
                  <span onClick={() => openEditPost(p)} className="text-primary cursor-pointer">
                    Edit
                  </span>
                  <span onClick={() => toggleAdopted(p)} className="text-[#1F7A4D] cursor-pointer">
                    {p.adopted ? "Mark Active" : "Mark Adopted"}
                  </span>
                  <span onClick={() => deletePost(p.id)} className="text-[#D64545] cursor-pointer">
                    Delete
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "Overview" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-4">
            <Stat label="Total Pets Listed" value={total} />
            <Stat label="Available" value={available} />
            <Stat label="Reserved" value={reserved} />
            <Stat label="Sold" value={sold} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mb-6">
            {bySpecies.map((c) => (
              <div key={c.label} className="bg-white border border-[#E4E9EC] rounded-[10px] p-4 text-center">
                <div className="text-xs text-[#8A96A3] mb-1">{c.label}</div>
                <div className="font-heading font-bold text-xl" style={{ color: c.color }}>
                  {c.count}
                </div>
              </div>
            ))}
          </div>

          <div className="text-[13px] font-bold text-[#1A2027] mb-3">All Pet Posts</div>
          {bySpecies.map((c) => {
            const items = pets.filter((p) => p.species === c.label);
            if (items.length === 0) return null;
            return (
              <div key={c.label} className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  <span className="text-[13px] font-bold text-[#1A2027]">
                    {c.label} ({items.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {items.map((p) => (
                    <div key={p.id} className="border-t-2 rounded-[10px] border border-[#E4E9EC] overflow-hidden" style={{ borderTopColor: c.color }}>
                      <div className="h-[100px] relative">
                        <MediaSlot src={p.photo} label="pet photo" className="absolute inset-0 w-full h-full" />
                        <div
                          className="absolute top-1.5 left-1.5 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded"
                          style={{ background: STATUS_COLORS[p.status] }}
                        >
                          {p.status}
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="font-bold text-sm text-[#1A2027]">{p.breed}</div>
                        <div className="text-xs text-[#8A96A3] mb-2.5">
                          {p.species} · {p.sex} · {p.age}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="flex-1 border border-[#E4E9EC] text-[#3A4652] text-xs font-semibold py-2 rounded-md cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => markSold(p)}
                            className="flex-1 bg-primary text-white text-xs font-semibold py-2 rounded-md cursor-pointer"
                          >
                            {p.status === "Sold" ? "Mark Available" : "Mark Sold"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}

      {modalOpen && <PetFormModal initial={editing} onClose={() => setModalOpen(false)} onSave={handleSave} />}
      {adoptionModalOpen && (
        <AdoptionFormModal initial={editingPost} onClose={() => setAdoptionModalOpen(false)} onSave={handleSavePost} />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-[#E4E9EC] rounded-[10px] p-4">
      <div className="text-[11px] text-[#8A96A3] font-semibold mb-2">{label}</div>
      <div className="font-heading font-bold text-xl text-[#1A2027]">{value}</div>
    </div>
  );
}
