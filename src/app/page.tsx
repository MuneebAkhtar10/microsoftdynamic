import { pullFinanceStats } from "@/lib/dynamics/sync";
import { listOrders } from "@/lib/portal/mock";
import { SyncNowButton } from "./components/SyncNowButton";
import { PushOrderButton } from "./components/PushOrderButton";
import { NewOrderForm } from "./components/NewOrderForm";

export const dynamic = "force-dynamic";

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency, minimumFractionDigits: amount % 1 === 0 ? 0 : 2 }).format(amount);
}

/**
 * Demo dashboard.
 *
 * Left side is Dynamics → portal (live orders pulled from the custom `cr3d4_portalorder`
 * Dataverse table), right side is portal → Dynamics (orders waiting to be pushed). Both
 * talk to `src/lib/dynamics/client.ts`, which is a mock until `DYNAMICS_TENANT_ID` etc.
 * are set, then it's your real environment.
 */
export default async function Dashboard() {
  const stats = await pullFinanceStats();
  const orders = await listOrders();

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 20px 60px" }}>
      <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, margin: "0 0 6px" }}>Dynamics 365 Integration Demo</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
            {stats.source === "mock"
              ? "Showing a simulated Dynamics environment — set DYNAMICS_TENANT_ID, DYNAMICS_CLIENT_ID, DYNAMICS_CLIENT_SECRET and DYNAMICS_RESOURCE_URL in .env.local to point this at a real environment."
              : "Live data from the connected Dynamics 365 environment."}
          </p>
        </div>
        <SyncNowButton />
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 32 }}>
        <StatCard label="Orders in Dynamics" value={stats.orderCount.toString()} />
        <StatCard label="Total value" value={formatMoney(stats.totalValue, stats.currency)} />
      </div>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 10 }}>Dynamics → Portal · Top customers by value</h2>
        <div className="table-container">
          <table>
            <thead><tr><th>Customer</th><th style={{ width: 140 }}>Total value</th></tr></thead>
            <tbody>
              {stats.topCustomers.map((c) => (
                <tr key={c.name}>
                  <td>{c.name}</td>
                  <td className="tabular">{formatMoney(c.totalValue, stats.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 10 }}>Recent orders in Dynamics</h2>
        <div className="table-container">
          <table>
            <thead><tr><th style={{ width: 130 }}>Reference</th><th>Customer</th><th style={{ width: 120 }}>Amount</th></tr></thead>
            <tbody>
              {stats.recentOrders.map((o) => (
                <tr key={o.id}>
                  <td className="tabular">{o.reference}</td>
                  <td>{o.customerName}</td>
                  <td className="tabular">{formatMoney(o.amount, stats.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 4 }}>Add an order on the portal</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>
          Submitting this creates the order and pushes it to Dynamics immediately — no separate sync step.
        </p>
        <NewOrderForm />
      </section>

      <section>
        <h2 style={{ fontSize: 16, marginBottom: 4 }}>Portal → Dynamics · Orders waiting to sync</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>
          These were seeded before auto-sync existed. Pushing one creates a matching record in Dynamics.
        </p>
        {orders.every((o) => o.syncedToDynamics) ? (
          <div className="card" style={{ padding: 24, textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>Everything is synced.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th style={{ width: 130 }}>Reference</th><th>Customer</th><th style={{ width: 110 }}>Amount</th><th style={{ width: 140 }}></th></tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="tabular">{o.reference}</td>
                    <td>{o.customerName}</td>
                    <td className="tabular">{formatMoney(o.amount, o.currency)}</td>
                    <td>{o.syncedToDynamics ? <span className="pill pill-delivered">Synced</span> : <PushOrderButton orderId={o.id} reference={o.reference} />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card" style={{ padding: "16px 18px" }}>
      <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 6px" }}>{label}</p>
      <p className="tabular" style={{ fontSize: 24, fontWeight: 650, margin: 0 }}>{value}</p>
    </div>
  );
}
