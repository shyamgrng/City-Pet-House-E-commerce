"use client";

import { createContext, useContext } from "react";
import { careerApplicationSeed, careerContentSeed } from "@/lib/career-seed";
import type { CareerApplication, CareerContent, CareerJob } from "@/lib/career-types";
import { useSiteContentStore } from "@/lib/site-content-store";

const CONTENT_KEY = "cph_career_content";
const APPLICATIONS_KEY = "cph_career_applications";

type ApplyInput = {
  name: string;
  phone: string;
  email: string;
  address: string;
  appliedFor: string;
  cvName: string;
  coverLetter: string;
};

type CareerValue = {
  content: CareerContent;
  applications: CareerApplication[];
  ready: boolean;
  setHeadline: (headline: string) => void;
  setCtaLabel: (ctaLabel: string) => void;
  setBannerImage: (bannerImage: string) => void;
  setTeamPhoto: (teamPhoto: string) => void;
  addJob: () => void;
  updateJob: (id: string, patch: Partial<Omit<CareerJob, "id">>) => void;
  removeJob: (id: string) => void;
  submitApplication: (input: ApplyInput) => void;
  moveToFolder: (id: string, jobTitle: string) => void;
  markRejected: (id: string) => void;
  removeApplication: (id: string) => void;
};

const CareerContext = createContext<CareerValue | null>(null);

export function CareerProvider({ children }: { children: React.ReactNode }) {
  const { data: content, ready: contentReady, update: persistContent } = useSiteContentStore<CareerContent>(CONTENT_KEY, careerContentSeed);
  const {
    data: applications,
    ready: applicationsReady,
    update: persistApplications,
  } = useSiteContentStore<CareerApplication[]>(APPLICATIONS_KEY, careerApplicationSeed);

  return (
    <CareerContext.Provider
      value={{
        content,
        applications,
        ready: contentReady && applicationsReady,
        setHeadline: (headline) => persistContent({ ...content, headline }),
        setCtaLabel: (ctaLabel) => persistContent({ ...content, ctaLabel }),
        setBannerImage: (bannerImage) => persistContent({ ...content, bannerImage }),
        setTeamPhoto: (teamPhoto) => persistContent({ ...content, teamPhoto }),
        addJob: () =>
          persistContent({
            ...content,
            jobs: [
              ...content.jobs,
              { id: "job-" + Math.random().toString(36).slice(2, 8), title: "New Position", photo: "", tag: "Full-time", desc: "Role description" },
            ],
          }),
        updateJob: (id, patch) => persistContent({ ...content, jobs: content.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)) }),
        removeJob: (id) => persistContent({ ...content, jobs: content.jobs.filter((j) => j.id !== id) }),
        submitApplication: (input) => {
          const application: CareerApplication = { ...input, id: "app-" + Math.random().toString(36).slice(2, 8), status: "New", submittedAt: Date.now() };
          persistApplications([application, ...applications]);
        },
        moveToFolder: (id, jobTitle) =>
          persistApplications(applications.map((a) => (a.id === id ? { ...a, appliedFor: jobTitle, status: "Reviewed" } : a))),
        markRejected: (id) => persistApplications(applications.map((a) => (a.id === id ? { ...a, status: "Rejected" } : a))),
        removeApplication: (id) => persistApplications(applications.filter((a) => a.id !== id)),
      }}
    >
      {children}
    </CareerContext.Provider>
  );
}

export function useCareer() {
  const ctx = useContext(CareerContext);
  if (!ctx) throw new Error("useCareer must be used within CareerProvider");
  return ctx;
}
