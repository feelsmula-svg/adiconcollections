import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/app/lib/auth/server";
import { getMessageRepository } from "@/app/lib/messages/message-repository";
import { notifyAdmins } from "@/app/lib/notifications/notify";

const bodySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(160, "Too long"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email is required")
    .email("Enter a valid email"),
  subject: z
    .string()
    .trim()
    .min(1, "Subject is required")
    .max(200, "Subject is too long"),
  body: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(4000, "Message is too long"),
});

export async function POST(request: Request) {
  if (!isJson(request)) {
    return NextResponse.json(
      { error: "Content-Type must be application/json" },
      { status: 415 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const session = await getSessionUser();

  try {
    const repo = await getMessageRepository();
    const message = await repo.create({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      body: parsed.data.body,
      userId: session?.id,
    });

    void notifyAdmins({
      kind: "other",
      title: `New message: ${message.subject}`,
      body: `From ${message.name} <${message.email}>`,
      link: `/admin/messages/${message.id}`,
    });

    return NextResponse.json(
      { ok: true, id: message.id },
      { status: 201 },
    );
  } catch (error: unknown) {
    const errMessage =
      error instanceof Error ? error.message : "Could not send message";
    console.error("[contact/messages] error:", errMessage);
    return NextResponse.json(
      { error: "Could not send your message. Please try again." },
      { status: 500 },
    );
  }
}

function isJson(request: Request): boolean {
  const ct = request.headers.get("content-type") ?? "";
  return ct.toLowerCase().startsWith("application/json");
}
