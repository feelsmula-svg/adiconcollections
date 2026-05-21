import { NextResponse } from "next/server";
import { z } from "zod";

import {
  AdminAccessError,
  requireAdmin,
  toPublicUser,
} from "@/app/lib/auth/server";
import { getUserRepository } from "@/app/lib/auth/user-repository";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const roleSchema = z.object({
  role: z.enum(["customer", "admin"]),
});

function isJson(request: Request): boolean {
  const ct = request.headers.get("content-type") ?? "";
  return ct.toLowerCase().startsWith("application/json");
}

export async function PATCH(request: Request, context: RouteContext) {
  let actor;
  try {
    actor = await requireAdmin();
  } catch (error: unknown) {
    if (error instanceof AdminAccessError) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 },
      );
    }
    throw error;
  }

  if (!isJson(request)) {
    return NextResponse.json(
      { success: false, error: "Content-Type must be application/json" },
      { status: 415 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = roleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { id } = await context.params;

  if (id === actor.id && parsed.data.role !== "admin") {
    return NextResponse.json(
      { success: false, error: "You cannot remove your own admin role." },
      { status: 400 },
    );
  }

  const repo = await getUserRepository();
  const updated = await repo.updateRole(id, parsed.data.role);
  if (!updated) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 },
    );
  }
  return NextResponse.json({ success: true, data: toPublicUser(updated) });
}
