import { buildDefaultTimeline } from "@/data/timeline";
import { uid } from "@/lib/sow-utils";
import { Contact, SOWState } from "@/types/sow";

export const STORAGE_KEY = "phaos-sow-state-v1";
export const ARCHIVE_KEY = "phaos-sow-archives-v1";

export const blankContact = (): Contact => ({ id: uid(), name: "", title: "", email: "", phone: "" });

export const createInitialSowState = (): SOWState => ({
  companyName: "",
  locationAddress: "",
  approvedBy: "",
  projectApprovalDate: "",
  targetGoLiveDate: "",
  projectDeliverables: "",
  contactsCustomer: [blankContact()],
  contactsPhaos: [blankContact()],
  answers: {},
  tier2Revealed: false,
  tier3Revealed: false,
  submitted: false,
  archived: false,
  version: 1,
  reactivationHistory: [],
  actionLog: [],
  timeline: buildDefaultTimeline(),
});

export const hydrateSowState = (partial?: Partial<SOWState> | null): SOWState => {
  const base = createInitialSowState();

  return {
    ...base,
    ...partial,
    contactsCustomer: partial?.contactsCustomer?.length ? partial.contactsCustomer : base.contactsCustomer,
    contactsPhaos: partial?.contactsPhaos?.length ? partial.contactsPhaos : base.contactsPhaos,
    answers: partial?.answers ?? base.answers,
    reactivationHistory: partial?.reactivationHistory ?? base.reactivationHistory,
    actionLog: partial?.actionLog ?? base.actionLog,
    timeline: partial?.timeline?.length ? partial.timeline : base.timeline,
  };
};