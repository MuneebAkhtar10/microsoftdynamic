import { NextRequest } from "next/server";
import { createAndSyncOrder } from "@/lib/dynamics/sync";

export const runtime = "nodejs";

/** New portal order → immediately synced to Dynamics. This is the "add here, appears there" path. */
export async function POST(req: NextRequest) {
  try {
    const { customerName, amount } = await req.json();
    if (typeof customerName !== "string" || !customerName.trim()) {
      return Response.json({ error: "customerName is required" }, { status: 400 });
    }
    const amountNumber = Number(amount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      return Response.json({ error: "amount must be a positive number" }, { status: 400 });
    }

    const result = await createAndSyncOrder({ customerName: customerName.trim(), amount: amountNumber });
    return Response.json(result, { status: 201 });
  } catch (err) {
    console.error("[api/portal/orders]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
