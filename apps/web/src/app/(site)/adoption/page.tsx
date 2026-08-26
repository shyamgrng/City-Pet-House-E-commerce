"use client";

import Link from "next/link";
import { useState } from "react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import MediaSlot from "@/components/MediaSlot";
import PhoneInput from "@/components/PhoneInput";
import { useAdoption } from "@/context/AdoptionContext";
import { useAuth } from "@/context/AuthContext";
import { daysLeft, isExpired } from "@/lib/adoption-types";
import { isValidNepalPhone } from "@/lib/phone";

export default function AdoptionPage() {
  const { posts: allPosts } = useAdoption();
  const { user, ready } = useAuth();
  const posts = allPosts.filter((p) => !isExpired(p));

  return (
    <div>
      <div
        className="mx-8 mt-7 mb-6 p-8 rounded-2xl flex items-center justify-between gap-5 flex-wrap"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #EAF4F9, #EAF4F9 10px, #DCEBF3 10px, #DCEBF3 20px)",
        }}
      >
        <div>
          <div className="font-heading font-bold text-xl text-[#1A2027] mb-1.5">Help a Dog Find a Home</div>
          <div className="text-[13px] text-[#3A4652] max-w-[480px]">
            Post an adoption notice for free — your listing stays live for 15 days and can be extended on request.
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 flex gap-7 flex-wrap">
        <div className="flex-[1.4] min-w-[400px]">
          <div className="font-heading font-bold text-base text-[#1A2027] mb-4">Dogs Looking for a Home</div>
          {posts.length === 0 ? (
            <div className="border border-dashed border-[#E4E9EC] rounded-xl p-10 text-center text-xs text-[#8A96A3]">
              No adoption notices right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {posts.map((post) => (
                <div key={post.id} className="rounded-[10px] overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-lg">
                  <div className="aspect-square relative">
                    <MediaSlot src={post.photo} label={post.photoAlt || post.breed} className="absolute inset-0 w-full h-full" />
                    {!post.adopted && (
                      <div className="absolute top-1.5 left-1.5 bg-[#1F7A4D] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                        For Adoption
                      </div>
                    )}
                    {post.adopted && (
                      <div
                        className="absolute top-2 right-2 bg-[#1F7A4D] text-white text-[11px] font-bold px-2.5 py-1 rounded-md"
                        style={{ transform: "rotate(-6deg)" }}
                      >
                        ADOPTED
                      </div>
                    )}
                  </div>
                  <div className="p-3.5">
                    <div className="text-sm font-bold text-[#1A2027]">
                      {post.name} · {post.breed}
                    </div>
                    <div className="text-xs text-[#8A96A3] mt-0.5">
                      {post.sex} · {post.age}
                    </div>
                    <div className="text-[11px] text-primary font-semibold mt-1">💉 {post.vaccination}</div>
                    <div className="text-[11px] text-[#8A96A3] mt-0.5">📍 {post.address}</div>
                    <div className="text-xs text-[#5B6773] leading-relaxed my-2">{post.desc}</div>
                    <div className="text-[11px] font-semibold text-[#1F7A4D] bg-[#E6F3EC] inline-block px-2 py-1 rounded-md mb-2.5">
                      {daysLeft(post)} days left on listing
                    </div>
                    <a
                      href={`tel:${post.contact}`}
                      className="block w-full bg-primary text-white text-center py-2 rounded-lg text-xs font-semibold cursor-pointer no-underline"
                    >
                      📞 Contact Owner — {post.contact}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-[320px] border border-[#E4E9EC] rounded-2xl p-6 h-fit">
          <div className="font-heading font-bold text-base text-[#1A2027] mb-2">Post an Adoption Notice</div>
          {!ready ? null : user ? (
            <PostAdoptionForm ownerId={user.id} defaultContact={user.phone} />
          ) : (
            <>
              <div className="text-[13px] text-[#5B6773] leading-relaxed mb-[18px]">
                You need a free account to post an adoption notice — this helps us verify listings and follow up with you.
              </div>
              <Link
                href="/signin?redirect=/adoption"
                className="block w-full bg-primary text-white text-center py-3 rounded-[9px] text-sm font-semibold cursor-pointer"
              >
                Sign In or Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PostAdoptionForm({ ownerId, defaultContact }: { ownerId: string; defaultContact: string }) {
  const { addPost } = useAdoption();
  const [photo, setPhoto] = useState("");
  const [photoAlt, setPhotoAlt] = useState("");
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"Male" | "Female">("Male");
  const [vaccination, setVaccination] = useState("");
  const [address, setAddress] = useState("");
  const [desc, setDesc] = useState("");
  const [contact, setContact] = useState(defaultContact);
  const [posted, setPosted] = useState(false);
  const [error, setError] = useState("");

  const canSave = name.trim().length > 0 && breed.trim().length > 0 && isValidNepalPhone(contact);

  const submit = () => {
    if (!canSave) return;
    setError("");
    try {
      addPost({ photo, photoAlt, name, breed, age, sex, vaccination, address, desc, contact, postedAt: Date.now(), adopted: false, ownerId });
    } catch {
      setError("Couldn't post — your browser's storage is full. Delete an old photo or video somewhere on the site to free up space, then try again.");
      return;
    }
    setPhoto("");
    setPhotoAlt("");
    setName("");
    setBreed("");
    setAge("");
    setVaccination("");
    setAddress("");
    setDesc("");
    setPosted(true);
    setTimeout(() => setPosted(false), 3000);
  };

  return (
    <div>
      <FormLabel>Dog&apos;s Photo</FormLabel>
      <div className="mb-3.5">
        <ImageUploadField
          value={photo}
          onChange={setPhoto}
          label="Photo"
          height="h-[140px]"
          maxWidth={1000}
          maxHeight={1000}
          crop
          alt={photoAlt}
          onAltChange={setPhotoAlt}
        />
      </div>

      <FormLabel>Dog&apos;s Name *</FormLabel>
      <FormInput value={name} onChange={setName} />
      <FormLabel>Breed *</FormLabel>
      <FormInput value={breed} onChange={setBreed} />
      <FormLabel>Age</FormLabel>
      <FormInput value={age} onChange={setAge} placeholder="e.g. 1.5 years" />

      <FormLabel>Sex</FormLabel>
      <div className="flex gap-2 mb-3">
        {(["Male", "Female"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSex(s)}
            className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
            style={{ background: sex === s ? "#1996C8" : "#F0F2F4", color: sex === s ? "#fff" : "#5B6773" }}
          >
            {s}
          </button>
        ))}
      </div>

      <FormLabel>Vaccination</FormLabel>
      <FormInput value={vaccination} onChange={setVaccination} placeholder="e.g. Up to date" />
      <FormLabel>Description</FormLabel>
      <FormInput value={desc} onChange={setDesc} />
      <FormLabel>Contact Number</FormLabel>
      <PhoneInput value={contact} onChange={setContact} />
      <FormLabel>Address</FormLabel>
      <FormInput value={address} onChange={setAddress} />

      {posted && <div className="text-xs text-[#1F7A4D] mb-2.5">✓ Your adoption notice is live.</div>}
      {error && <div className="text-xs text-[#D64545] mb-2.5">{error}</div>}
      <button
        disabled={!canSave}
        onClick={submit}
        className="w-full bg-primary text-white text-center py-3 rounded-[9px] text-sm font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Post Notice
      </button>
    </div>
  );
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-semibold text-[#3A4652] mb-1.5">{children}</div>;
}

function FormInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-3 box-border"
    />
  );
}
