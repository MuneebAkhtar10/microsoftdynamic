"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PushOrderButton({ orderId, reference }: { orderId: string; reference: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function push() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/dynamics/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "That didn't work."); return; }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button type="button" className="btn btn-primary" onClick={push} disabled={busy}>
        {busy ? "Pushing…" : `Push ${reference}`}
      </button>
      {error && <p role="alert" style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>{error}</p>}
    </div>
  );
}
