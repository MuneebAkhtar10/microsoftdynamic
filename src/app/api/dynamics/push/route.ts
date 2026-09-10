import { NextRequest } from "next/server";
import { pushOrderToDynamics, DynamicsSyncError } from "@/lib/dynamics/sync";

export const runtime = "nodejs";

/** Portal → F&O: record one order as a Customer + Sales Order. */
export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (typeof orderId !== "string" || !orderId) {
      return Response.json({ error: "orderId is required" }, { status: 400 });
    }
    const result = await pushOrderToDynamics(orderId);
    return Response.json(result);
  } catch (err) {
    if (err instanceof DynamicsSyncError) {
      return Response.json({ error: err.message }, { status: 422 });
    }
    console.error("[api/dynamics/push]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
