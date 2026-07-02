export interface Contact {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
}

export interface Question {
  id: string;
  tier: 1 | 2 | 3;
  label: string;
  placeholder?: string;
}

export interface ReactivationEvent {
  date: string; // MM/DD/YYYY
  version: number;
  by: string;
}

export interface SOWState {
  companyName: string;
  locationAddress: string;
  approvedBy: string;
  projectApprovalDate: string;
  targetGoLiveDate: string;
  projectDeliverables: string;
  contactsCustomer: Contact[];
  contactsPhaos: Contact[];
  answers: Record<string, string>;
  tier2Revealed: boolean;
  tier3Revealed: boolean;
  submitted: boolean;
  archived: boolean;
  version: number;
  reactivationHistory: ReactivationEvent[];
  actionLog: string[];
  submittedAt?: string;
  timeline?: TimelineMilestone[];
}

export type ArchivedSOWKind = "saved" | "submitted";

export interface ArchivedSOW {
  id: string;
  state: SOWState;
  archivedAt: string;
  kind: ArchivedSOWKind;
  savedBy?: string;
}

export interface TimelineAssignee {
  id: string; // contact id
  name: string;
  side: "customer" | "phaos";
}

export interface TimelineMilestone {
  id: string;
  phase: string;
  title: string;
  weeks: string;
  dateRange: string;
  description: string;
  bullets: { owner: string; text: string }[];
  assignees: TimelineAssignee[];
}
