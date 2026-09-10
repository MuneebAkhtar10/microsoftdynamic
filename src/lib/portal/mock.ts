/**
 * "Our portal" — a stand-in for the client's actual system.
 *
 * This is deliberately generic: an order placed on our side, with a customer name and
 * amount, that hasn't been recorded in Dynamics yet. Swap this module for real calls
 * into the client's portal database/API once we know what it is — `sync.ts` only needs
 * `listUnsyncedOrders` and `markSynced` to keep working the same way.
 */

export interface PortalOrder {
  id: string;
  reference: string;
  customerName: string;
  amount: number;
  currency: string;
  placedAt: string;
  syncedToDynamics: boolean;
}

const orders: PortalOrder[] = [
  { id: "1", reference: "PORTAL-0091", customerName: "Meridian Lending Group", amount: 3200, currency: "GBP", placedAt: "2026-09-08", syncedToDynamics: false },
  { id: "2", reference: "PORTAL-0092", customerName: "Harrow & Bright Ltd", amount: 950, currency: "GBP", placedAt: "2026-09-09", syncedToDynamics: false },
  { id: "3", reference: "PORTAL-0093", customerName: "Cornerstone Finance", amount: 5400, currency: "GBP", placedAt: "2026-09-09", syncedToDynamics: false },
];

export async function listOrders(): Promise<PortalOrder[]> {
  return [...orders];
}

export async function listUnsyncedOrders(): Promise<PortalOrder[]> {
  return orders.filter((o) => !o.syncedToDynamics);
}

export async function markSynced(orderId: string): Promise<void> {
  const order = orders.find((o) => o.id === orderId);
  if (order) order.syncedToDynamics = true;
}

/** A new order placed on the portal — e.g. a customer checking out. */
export async function createOrder(input: { customerName: string; amount: number }): Promise<PortalOrder> {
  const reference = `PORTAL-${(1000 + orders.length + 1).toString().padStart(4, "0")}`;
  const order: PortalOrder = {
    id: (orders.length + 1).toString() + "-" + Date.now(),
    reference,
    customerName: input.customerName,
    amount: input.amount,
    currency: "GBP",
    placedAt: new Date().toISOString().slice(0, 10),
    syncedToDynamics: false,
  };
  orders.push(order);
  return order;
}
