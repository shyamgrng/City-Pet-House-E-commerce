"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BlogFormModal from "@/components/blog/BlogFormModal";
import AvailabilityTab from "@/components/doctor/AvailabilityTab";
import FinanceTab from "@/components/doctor/FinanceTab";
import ProfileTab from "@/components/doctor/ProfileTab";
import { useBlog } from "@/context/BlogContext";
import { useDoctorAuth } from "@/context/DoctorAuthContext";
import { useVet } from "@/context/VetContext";
import { isAuthoredBy, type BlogPost } from "@/lib/blog-types";
import { STATUS_COLORS } from "@/lib/vet-types";

const TABS = ["Overview", "Bookings", "Upcoming", "Availability", "Finance", "Blog", "Profile"] as const;
type Tab = (typeof TABS)[number];

export default function DoctorPortalPage() {
  const { doctor, ready, signOut } = useDoctorAuth();
  const { doctors, bookings, toggleDoctorOnline } = useVet();
  const { posts, addPost, updatePost, deletePost } = useBlog();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Overview");
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    if (ready && !doctor) router.replace("/doctor/login");
  }, [ready, doctor, router]);

  if (!ready || !doctor) return null;

  const doctorRecord = doctors.find((d) => d.id === doctor.doctorId);
  const mine = bookings.filter((b) => b.doctorId === doctor.doctorId);
  const completed = mine.filter((b) => b.status === "Completed");
  const upcoming = mine.filter((b) => b.status === "Confirmed" || b.status === "In Progress");
  const readyForCall = mine.filter((b) => b.status === "In Progress" || (b.status === "Confirmed" && b.instant));
  const received = completed.reduce((sum, b) => sum + b.amount, 0);
  const remaining = upcoming.reduce((sum, b) => sum + b.amount, 0);
  const ownPosts = posts.filter((p) => isAuthoredBy(p.author, doctor.name));

  const openAddPost = () => {
    setEditingPost(null);
    setBlogModalOpen(true);
  };
  const openEditPost = (p: BlogPost) => {
    setEditingPost(p);
    setBlogModalOpen(true);
  };
  const handleSavePost = (draft: Omit<BlogPost, "id">) => {
    if (editingPost) updatePost(editingPost.id, draft);
    else addPost(draft);
    setBlogModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FA]">
      <div className="bg-white border-b border-[#E4E9EC] px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image src="/assets/cph-logo.jpeg" alt="" width={28} height={28} className="rounded-md object-cover" />
          <span className="font-heading font-bold text-sm text-[#1A2027]">CPH Doctor Portal</span>
        </div>
        <button
          onClick={() => {
            signOut();
            router.push("/doctor/login");
          }}
          className="text-xs font-semibold text-[#D64545] cursor-pointer"
        >
          Sign Out
        </button>
      </div>

      <div className="px-8 py-7 max-w-[900px]">
        <div className="flex gap-2 flex-wrap mb-[22px]">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2.5 rounded-full text-xs font-semibold cursor-pointer border border-[#E4E9EC]"
              style={{ background: tab === t ? "#1996C8" : "#fff", color: tab === t ? "#fff" : "#3A4652" }}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Overview" && (
          <>
            <div className="font-heading font-bold text-lg text-[#1A2027] mb-1">Welcome, {doctor.name}</div>
            <div className="text-[13px] text-[#8A96A3] mb-5">Here&apos;s what&apos;s happening with your consults today.</div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-5">
              <Stat label="Completed Bookings" value={completed.length} color="#1A2027" />
              <Stat label="Upcoming Bookings" value={upcoming.length} color="#1996C8" />
              <Stat label="Amount Received" value={`Rs. ${received}`} color="#1F7A4D" />
              <Stat label="Remaining to Receive" value={`Rs. ${remaining}`} color="#D64545" />
            </div>

            {doctorRecord && (
              <div className="border border-[#E4E9EC] rounded-xl p-4 mb-5 flex justify-between items-center max-w-[480px]">
                <div>
                  <div className="text-sm font-semibold text-[#1A2027]">Availability</div>
                  <div className="text-xs text-[#8A96A3] mt-0.5">{doctorRecord.online ? "You're online — clients can book you now" : "You're offline"}</div>
                </div>
                <button
                  onClick={() => toggleDoctorOnline(doctorRecord.id)}
                  className="w-11 h-6 rounded-full relative cursor-pointer"
                  style={{ background: doctorRecord.online ? "#25D366" : "#D8DCE0" }}
                >
                  <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all" style={{ left: doctorRecord.online ? "20px" : "2px" }} />
                </button>
              </div>
            )}

            <div className="text-lg font-bold text-[#1A2027] mb-3.5">Ready for a Call</div>
            {readyForCall.length === 0 ? (
              <div className="text-xs text-[#8A96A3] py-4">Nothing scheduled right now</div>
            ) : (
              readyForCall.map((b) => (
                <Link
                  key={b.id}
                  href={`/doctor/booking/${b.id}`}
                  className="flex justify-between items-center px-[22px] py-5 bg-[#FFF7DE] border-2 border-[#F2C94C] rounded-xl mb-3.5"
                >
                  <div>
                    <div className="text-lg font-bold text-[#1A2027]">
                      {b.ownerName} — {b.petName}
                    </div>
                    <div className="text-[15px] text-[#8A6D1F] mt-1">
                      {b.instant ? "Available now" : `${b.scheduledDate} ${b.scheduledTime}`} · {b.reason}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </>
        )}

        {tab === "Bookings" && <BookingList bookings={mine} />}
        {tab === "Upcoming" && <BookingList bookings={upcoming} />}
        {tab === "Availability" && <AvailabilityTab doctorId={doctor.doctorId} />}
        {tab === "Finance" && <FinanceTab bookings={mine} />}
        {tab === "Profile" && <ProfileTab doctorRecord={doctorRecord} />}

        {tab === "Blog" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="text-[13px] font-bold text-[#1A2027]">My Blog Posts</div>
              <button onClick={openAddPost} className="bg-primary text-white px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer">
                + New Article
              </button>
            </div>
            <div className="bg-white border border-[#E4E9EC] rounded-[10px] overflow-hidden">
              {ownPosts.length === 0 ? (
                <div className="px-4 py-4 text-xs text-[#8A96A3] text-center">You haven&apos;t published any articles yet</div>
              ) : (
                ownPosts.map((post) => (
                  <div key={post.id} className="flex justify-between items-center px-4 py-3 border-b border-[#F0F2F4] last:border-0">
                    <div onClick={() => openEditPost(post)} className="text-[13px] font-semibold text-[#1A2027] cursor-pointer flex-1">
                      {post.title}
                    </div>
                    <div className="flex gap-3.5 items-center shrink-0 ml-2">
                      <div className="text-[11px] text-[#8A96A3]">{post.date}</div>
                      <div onClick={() => openEditPost(post)} className="text-xs font-semibold text-primary cursor-pointer">
                        Edit
                      </div>
                      <div onClick={() => deletePost(post.id)} className="text-xs font-semibold text-[#D64545] cursor-pointer">
                        Delete
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {blogModalOpen && (
        <BlogFormModal initial={editingPost} lockAuthorAs={doctor.name} onClose={() => setBlogModalOpen(false)} onSave={handleSavePost} />
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="border border-[#E4E9EC] rounded-xl p-4">
      <div className="text-[11px] text-[#8A96A3] mb-1.5">{label}</div>
      <div className="font-heading font-bold text-xl" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function BookingList({ bookings }: { bookings: import("@/lib/vet-types").VetBooking[] }) {
  if (bookings.length === 0) {
    return <div className="py-5 text-xs text-[#8A96A3] text-center">No bookings yet</div>;
  }
  return (
    <div>
      {bookings.map((b) => (
        <Link key={b.id} href={`/doctor/booking/${b.id}`} className="flex justify-between items-center py-3.5 border-b border-[#EEF1F3] last:border-0">
          <div>
            <div className="text-[13px] font-semibold text-[#1A2027]">
              {b.ownerName} — {b.petName}
            </div>
            <div className="text-xs text-[#8A96A3]">
              {b.instant ? "Online now" : `${b.scheduledDate} ${b.scheduledTime}`} · {b.reason}
            </div>
          </div>
          <div className="text-[11px] font-semibold" style={{ color: STATUS_COLORS[b.status] }}>
            {b.status}
          </div>
        </Link>
      ))}
    </div>
  );
}
