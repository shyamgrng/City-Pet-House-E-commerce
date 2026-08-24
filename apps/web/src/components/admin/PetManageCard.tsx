"use client";

import { useRef, useState } from "react";
import { usePets } from "@/context/PetContext";
import { IMAGE_ACCEPT, VIDEO_ACCEPT, isAllowedImageFile, isAllowedVideoFile, readVideoFile } from "@/lib/image-upload";
import ImageCropModal from "./ImageCropModal";
import { dewormStages, formatRs, petSpeciesList, vaccineStages, type Pet, type PetStatus } from "@/lib/pet-types";

const SPECIES_COLORS: Record<string, string> = {
  Dog: "#1996C8",
  Cat: "#C9962B",
  "Small Pets": "#7A56C8",
  Birds: "#1F7A4D",
  Fish: "#17A2A0",
};

const statuses: PetStatus[] = ["Available", "Reserved", "Sold"];

export default function PetManageCard({ pet }: { pet: Pet }) {
  const { updatePet, deletePet, saveError } = usePets();
  const [justUpdated, setJustUpdated] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const patch = (fields: Partial<Omit<Pet, "id">>) => updatePet(pet.id, { ...pet, ...fields });

  const flashUpdated = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setJustUpdated(true);
    timerRef.current = setTimeout(() => setJustUpdated(false), 3000);
  };

  const savePhotoAt = (index: number, dataUrl: string, alt: string) => {
    const photos = pet.photos.map((p, i) => (i === index ? dataUrl : p));
    const photoAlts = pet.photoAlts.map((a, i) => (i === index ? alt : a));
    patch({ photos, photoAlts });
  };

  const setVideo = async (file: File | undefined) => {
    if (!file) return;
    setPhotoError("");
    if (!isAllowedVideoFile(file)) {
      setPhotoError("Please choose a video file (MP4, MPEG, MPG, or WMV).");
      return;
    }
    try {
      const dataUrl = await readVideoFile(file);
      patch({ video: dataUrl });
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Could not process that video.");
    }
  };

  return (
    <div
      className="bg-white border border-[#E4E9EC] rounded-[10px] p-4 mb-3"
      style={{ borderLeft: `4px solid ${SPECIES_COLORS[pet.species] || "#8A96A3"}` }}
    >
      <div className="text-[10px] font-bold text-[#8A96A3] mb-2 uppercase">
        Photos &amp; Video (800×600px each) — click ★ to choose which photo shows on the post
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {pet.photos.map((src, i) => (
          <PhotoSlot
            key={i}
            src={src}
            alt={pet.photoAlts[i] || ""}
            index={i}
            isCover={pet.coverPhotoIndex === i}
            onPhotoChange={(dataUrl, alt) => savePhotoAt(i, dataUrl, alt)}
            onSetCover={() => patch({ coverPhotoIndex: i })}
          />
        ))}
        <VideoSlot video={pet.video} onFile={setVideo} />
      </div>
      {photoError && <div className="text-[11px] text-[#D64545] mb-3">{photoError}</div>}

      <div className="grid grid-cols-2 gap-2">
        <Field label="Breed / Name">
          <input value={pet.breed} onChange={(e) => patch({ breed: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Type">
          <select value={pet.species} onChange={(e) => patch({ species: e.target.value })} className={inputCls}>
            {petSpeciesList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Sex">
          <select value={pet.sex} onChange={(e) => patch({ sex: e.target.value })} className={inputCls}>
            {["Male", "Female", "Pair", "—"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Age">
          <input value={pet.age} onChange={(e) => patch({ age: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Price">
          <input
            value={String(pet.price)}
            onChange={(e) => patch({ price: Number(e.target.value.replace(/[^\d]/g, "")) || 0 })}
            placeholder={formatRs(0)}
            className={inputCls}
          />
        </Field>
        <Field label="Delivery Fee (Rs.)">
          <input
            value={String(pet.deliveryFee)}
            onChange={(e) => patch({ deliveryFee: Number(e.target.value.replace(/[^\d]/g, "")) || 0 })}
            className={inputCls}
          />
        </Field>
        <Field label="Status">
          <select value={pet.status} onChange={(e) => patch({ status: e.target.value as PetStatus })} className={inputCls}>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tags (comma separated)">
          <input
            value={pet.tags.join(", ")}
            onChange={(e) => patch({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
            className={inputCls}
          />
        </Field>

        <div className="col-span-2 mt-1.5">
          <StageChecklist
            label="Vaccination Status"
            stages={vaccineStages}
            done={pet.vaccinations}
            color="#1F7A4D"
            onToggle={(i) => patch({ vaccinations: pet.vaccinations.map((v, vi) => (vi === i ? !v : v)) })}
          />
        </div>
        <div className="col-span-2 mt-2.5">
          <StageChecklist
            label="Deworming Status"
            stages={dewormStages}
            done={pet.dewormings}
            color="#C9962B"
            onToggle={(i) => patch({ dewormings: pet.dewormings.map((v, vi) => (vi === i ? !v : v)) })}
          />
        </div>

        <div className="col-span-2 flex justify-between items-center mt-2.5">
          <button onClick={flashUpdated} className="bg-primary text-white text-xs font-semibold px-4.5 py-2 rounded-lg cursor-pointer">
            Update Pet
          </button>
          <span onClick={() => deletePet(pet.id)} className="text-[11px] font-semibold text-[#D64545] cursor-pointer">
            Delete Pet
          </span>
        </div>
        {saveError && <div className="col-span-2 text-[11px] text-[#D64545] bg-[#FDEDEC] border border-[#F3C6C2] rounded-md px-3 py-2 mt-1">{saveError}</div>}
        {justUpdated && !saveError && (
          <div className="col-span-2 bg-[#EAF7EF] border border-[#BEE6CC] rounded-md px-3 py-2 text-xs font-bold text-[#1F7A4D] text-center mt-1">
            ✓ Pet updated — live on the website
          </div>
        )}
      </div>
    </div>
  );
}

const inputCls = "w-full box-border h-8 rounded-md border border-[#E4E9EC] px-2.5 text-xs bg-white";

function StageChecklist({
  label,
  stages,
  done,
  color,
  onToggle,
}: {
  label: string;
  stages: readonly string[];
  done: boolean[];
  color: string;
  onToggle: (index: number) => void;
}) {
  const doneCount = done.filter(Boolean).length;
  return (
    <div>
      <div className="text-[10px] font-bold text-[#8A96A3] mb-1.5 uppercase">
        {label} ({doneCount}/{stages.length} doses)
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {stages.map((stage, i) => (
          <button
            key={i}
            type="button"
            title={stage}
            onClick={() => onToggle(i)}
            className="w-7 h-7 rounded-full text-[11px] font-bold cursor-pointer shrink-0"
            style={{ background: done[i] ? color : "#F0F2F4", color: done[i] ? "#fff" : "#5B6773" }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-[#8A96A3] mb-1 uppercase">{label}</div>
      {children}
    </div>
  );
}

function PhotoSlot({
  src,
  alt,
  index,
  isCover,
  onPhotoChange,
  onSetCover,
}: {
  src: string;
  alt: string;
  index: number;
  isCover: boolean;
  onPhotoChange: (dataUrl: string, alt: string) => void;
  onSetCover: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setError("");
    if (!isAllowedImageFile(file)) {
      setError("Please choose an image file.");
      return;
    }
    setPendingFile(file);
  };

  return (
    <div className="relative shrink-0 w-[100px]">
      <input ref={inputRef} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      {error && <div className="text-[9px] text-[#D64545] mb-1">{error}</div>}
      {pendingFile && (
        <ImageCropModal
          file={pendingFile}
          initialAlt={alt}
          onCancel={() => setPendingFile(null)}
          onConfirm={(dataUrl, newAlt) => {
            setPendingFile(null);
            onPhotoChange(dataUrl, newAlt);
          }}
        />
      )}
      {src ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded data: URL */}
          <img
            src={src}
            alt={alt || `pet photo ${index + 1}`}
            onClick={() => inputRef.current?.click()}
            className="w-[100px] h-20 rounded-lg object-cover cursor-pointer"
          />
          <div
            onClick={onSetCover}
            className="absolute top-1 right-1 w-5 h-5 rounded-[5px] flex items-center justify-center text-xs cursor-pointer"
            style={{ background: isCover ? "#FFC940" : "rgba(255,255,255,0.85)", color: isCover ? "#1A2027" : "#8A96A3" }}
            title="Set as cover photo"
          >
            ★
          </div>
        </>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="w-[100px] h-20 rounded-lg border border-dashed border-[#C7CDD3] bg-[#F7F9FA] flex flex-col items-center justify-center text-center px-1 cursor-pointer"
        >
          <div className="text-[11px] font-semibold text-[#5B6773]">{index === 0 ? "Cover" : `Photo ${index + 1}`}</div>
          <div className="text-[10px] text-primary underline">or browse files</div>
        </div>
      )}
    </div>
  );
}

function VideoSlot({ video, onFile }: { video: string; onFile: (file: File | undefined) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="shrink-0 w-[100px]">
      <input ref={inputRef} type="file" accept={VIDEO_ACCEPT} className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      {video ? (
        <>
          <video src={video} controls className="w-[100px] h-20 rounded-lg bg-black object-cover" />
          <div onClick={() => inputRef.current?.click()} className="text-[9px] text-primary text-center cursor-pointer mt-0.5">
            Replace video
          </div>
        </>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="w-[100px] h-20 rounded-lg border border-dashed border-[#C7CDD3] bg-[#F7F9FA] flex flex-col items-center justify-center gap-1 cursor-pointer"
        >
          <div className="text-base">🎬</div>
          <div className="text-[9px] text-[#8A96A3]">Upload video</div>
        </div>
      )}
      <div className="text-[9px] text-[#8A96A3] text-center mt-0.5">Video</div>
    </div>
  );
}
