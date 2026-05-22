export type ContactMessageStatus = "new" | "replied" | "archived";

export type ContactReplyChannel = "email" | "in-app" | "both";

export interface ContactMessageReply {
  id: string;
  body: string;
  channel: ContactReplyChannel;
  authorEmail: string;
  authorName?: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  /** Set when the sender was signed in at submission time. */
  userId?: string;
  status: ContactMessageStatus;
  createdAt: string;
  replies: ContactMessageReply[];
}

export const CONTACT_STATUS_LABEL: Record<ContactMessageStatus, string> = {
  new: "New",
  replied: "Replied",
  archived: "Archived",
};
