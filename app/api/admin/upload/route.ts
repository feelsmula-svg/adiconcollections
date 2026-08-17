import { NextResponse } from "next/server";

import { AdminAccessError, requireAdmin } from "@/app/lib/auth/server";

const MAX_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (error: unknown) {
    if (error instanceof AdminAccessError) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    throw error;
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Image must be JPG, PNG, WEBP, or GIF" }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Image must be under 4 MB" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const url = `data:${file.type};base64,${bytes.toString("base64")}`;

  return NextResponse.json({ url }, { status: 201 });
}
