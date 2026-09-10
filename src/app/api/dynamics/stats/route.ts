import { pullFinanceStats } from "@/lib/dynamics/sync";

export const runtime = "nodejs";

/** F&O → portal, on demand. Backs the "Sync now" button on the dashboard. */
export async function GET() {
  const stats = await pullFinanceStats();
  return Response.json(stats);
}
