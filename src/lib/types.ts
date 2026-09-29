export enum BountyStatus {
  OPEN = 0,
  PAID = 1,
  CANCELLED = 2,
}

export enum SubmissionStatus {
  NONE = 0,
  PENDING = 1,
  REJECTED = 2,
  APPROVED = 3,
}

export interface BountyItem {
  id: bigint;
  creator: `0x${string}`;
  reward: bigint;
  title: string;
  severity: number; // 1: LOW, 2: MEDIUM, 3: HIGH, 4: CRITICAL
  detailsHash: `0x${string}`;
  status: BountyStatus;
}

export interface SubmissionItem {
  researcher: `0x${string}`;
  reportHash: `0x${string}`;
  status: SubmissionStatus;
}

export const SEVERITY_MAP: Record<number, { label: string; color: string; bg: string; border: string }> = {
  1: { label: "LOW", color: "#00d4ff", bg: "rgba(0, 212, 255, 0.12)", border: "#00d4ff55" },
  2: { label: "MEDIUM", color: "#ffb800", bg: "rgba(255, 184, 0, 0.12)", border: "#ffb80055" },
  3: { label: "HIGH", color: "#ff7700", bg: "rgba(255, 119, 0, 0.12)", border: "#ff770055" },
  4: { label: "CRITICAL", color: "#ff0055", bg: "rgba(255, 0, 85, 0.15)", border: "#ff005577" },
};
