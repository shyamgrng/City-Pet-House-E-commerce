"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { careerApplicationSeed, careerContentSeed } from "@/lib/career-seed";
import type { CareerApplication, CareerContent, CareerJob } from "@/lib/career-types";

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

function loadContent(): CareerContent {
  const raw = window.localStorage.getItem(CONTENT_KEY);
  if (!raw) return careerContentSeed;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : careerContentSeed;
  } catch {
    return careerContentSeed;
  }
}

function loadApplications(): CareerApplication[] {
  const raw = window.localStorage.getItem(APPLICATIONS_KEY);
  if (!raw) return careerApplicationSeed;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : careerApplicationSeed;
  } catch {
    return careerApplicationSeed;
  }
}

export function CareerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ content: CareerContent; applications: CareerApplication[]; ready: boolean }>({
    content: careerContentSeed,
    applications: careerApplicationSeed,
    ready: false,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ content: loadContent(), applications: loadApplications(), ready: true });
  }, []);

  const persistContent = (content: CareerContent) => {
    window.localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
    setState((s) => ({ ...s, content, ready: true }));
  };

  const persistApplications = (applications: CareerApplication[]) => {
    window.localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
    setState((s) => ({ ...s, applications, ready: true }));
  };

  return (
    <CareerContext.Provider
      value={{
        content: state.content,
        applications: state.applications,
        ready: state.ready,
        setHeadline: (headline) => persistContent({ ...state.content, headline }),
        setCtaLabel: (ctaLabel) => persistContent({ ...state.content, ctaLabel }),
        setBannerImage: (bannerImage) => persistContent({ ...state.content, bannerImage }),
        setTeamPhoto: (teamPhoto) => persistContent({ ...state.content, teamPhoto }),
        addJob: () =>
          persistContent({
            ...state.content,
            jobs: [
              ...state.content.jobs,
              { id: "job-" + Math.random().toString(36).slice(2, 8), title: "New Position", photo: "", tag: "Full-time", desc: "Role description" },
            ],
          }),
        updateJob: (id, patch) => persistContent({ ...state.content, jobs: state.content.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)) }),
        removeJob: (id) => persistContent({ ...state.content, jobs: state.content.jobs.filter((j) => j.id !== id) }),
        submitApplication: (input) => {
          const application: CareerApplication = { ...input, id: "app-" + Math.random().toString(36).slice(2, 8), status: "New", submittedAt: Date.now() };
          persistApplications([application, ...state.applications]);
        },
        moveToFolder: (id, jobTitle) =>
          persistApplications(state.applications.map((a) => (a.id === id ? { ...a, appliedFor: jobTitle, status: "Reviewed" } : a))),
        markRejected: (id) => persistApplications(state.applications.map((a) => (a.id === id ? { ...a, status: "Rejected" } : a))),
        removeApplication: (id) => persistApplications(state.applications.filter((a) => a.id !== id)),
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
