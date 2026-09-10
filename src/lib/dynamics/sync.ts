import { getDynamicsClient } from "./client";
import { listUnsyncedOrders, markSynced, createOrder as createPortalOrder } from "@/lib/portal/mock";
import type { FinanceStats } from "./types";

/** Dynamics → portal: the numbers a dashboard would show. */
export async function pullFinanceStats(): Promise<FinanceStats> {
  const client = getDynamicsClient();
  const orders = await client.listOrders();

  const byCustomer = new Map<string, number>();
  for (const o of orders) {
    byCustomer.set(o.customerName, (byCustomer.get(o.customerName) ?? 0) + o.amount);
  }
  const topCustomers = [...byCustomer.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, totalValue]) => ({ name, totalValue }));

  return {
    source: client.source,
    fetchedAt: new Date().toISOString(),
    currency: "GBP",
    orderCount: orders.length,
    totalValue: orders.reduce((sum, o) => sum + o.amount, 0),
    recentOrders: [...orders].slice(0, 5),
    topCustomers,
  };
}

export class DynamicsSyncError extends Error {}

/** Portal → Dynamics: an order placed on our side becomes a record in cr3d4_portalorder. */
export async function pushOrderToDynamics(orderId: string) {
  const orders = await listUnsyncedOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) throw new DynamicsSyncError("Order not found or already synced");

  const client = getDynamicsClient();
  const created = await client.createOrder({
    reference: order.reference,
    customerName: order.customerName,
    amount: order.amount,
  });

  await markSynced(order.id);
  return { dynamicsOrderId: created.id };
}

/**
 * A new order placed on the portal, synced to Dynamics immediately rather than waiting
 * for a manual push or the scheduled job — this is what "adding something in the portal
 * shows up in Dynamics" means end to end.
 */
export async function createAndSyncOrder(input: { customerName: string; amount: number }) {
  const portalOrder = await createPortalOrder(input);
  const { dynamicsOrderId } = await pushOrderToDynamics(portalOrder.id);
  return { portalOrder, dynamicsOrderId };
}

/** Scheduled sync: pushes every unsynced portal order into Dynamics, then pulls fresh stats. */
export async function runFullSync() {
  const pushed: { orderId: string; dynamicsOrderId: string }[] = [];
  for (const order of await listUnsyncedOrders()) {
    const result = await pushOrderToDynamics(order.id);
    pushed.push({ orderId: order.id, ...result });
  }
  const stats = await pullFinanceStats();
  return { stats, pushed };
}
