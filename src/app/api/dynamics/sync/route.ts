import { NextRequest } from "next/server";
import crypto from "crypto";
import { runFullSync } from "@/lib/dynamics/sync";

export const runtime = "nodejs";

/**
 * Scheduled bidirectional sync — pushes every unsynced portal order into F&O, then pulls
 * fresh stats back. Intended to be called by a cron job (Vercel Cron, or any scheduler)
 * with `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const provided = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
    const authorized =
      provided.length === secret.length &&
      crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(secret));
    if (!authorized) return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { stats, pushed } = await runFullSync();
  return Response.json({ ok: true, syncedAt: stats.fetchedAt, source: stats.source, pushed });
}
