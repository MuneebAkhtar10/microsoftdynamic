"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Add an order on the portal — it's synced to Dynamics immediately, no separate push step. */
export function NewOrderForm() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName, amount: Number(amount) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "That didn't work."); return; }
      setCustomerName("");
      setAmount("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card" style={{ padding: 16, display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--muted)" }}>
        Customer name
        <input
          required value={customerName} onChange={(e) => setCustomerName(e.target.value)}
          placeholder="e.g. Harrow & Bright Ltd"
          style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, minWidth: 220 }}
        />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--muted)" }}>
        Amount (£)
        <input
          required type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 1500"
          style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, width: 140 }}
        />
      </label>
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Adding & syncing…" : "Add order"}
      </button>
      {error && <p role="alert" style={{ fontSize: 12, color: "var(--danger)", width: "100%", margin: 0 }}>{error}</p>}
    </form>
  );
}
