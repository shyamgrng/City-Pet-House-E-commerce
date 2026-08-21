export type CareerJob = {
  id: string;
  title: string;
  photo: string;
  tag: string;
  desc: string;
};

export type ApplicationStatus = "New" | "Reviewed" | "Rejected";

export type CareerApplication = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  appliedFor: string;
  cvName: string;
  coverLetter: string;
  status: ApplicationStatus;
  submittedAt: number;
};

export type CareerContent = {
  headline: string;
  ctaLabel: string;
  bannerImage: string;
  teamPhoto: string;
  jobs: CareerJob[];
};

export const STATUS_COLORS: Record<ApplicationStatus, { bg: string; color: string }> = {
  New: { bg: "#FDF0E4", color: "#C9962B" },
  Reviewed: { bg: "#E7F3EC", color: "#1F7A4D" },
  Rejected: { bg: "#FBE9E9", color: "#D64545" },
};
