"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SyncNowButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function sync() {
    setBusy(true);
    try {
      await fetch("/api/dynamics/stats");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className="btn btn-ghost" onClick={sync} disabled={busy}>
      <span className={busy ? "animate-pulse-soft" : undefined}>{busy ? "Syncing…" : "Sync now"}</span>
    </button>
  );
}
