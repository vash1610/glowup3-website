// Shared currency helpers. Supabase money columns (customer_wallets, pro_wallets,
// wallet_transactions, escrow, appointments) store plain CZK major units.
// Stripe's API and the reconciliation_logs audit table both use CZK cents.
// Mixing these up silently produced 100x-wrong numbers in several routes —
// always convert at the boundary instead of doing ad hoc /100 or *100 inline.

export function czkToCents(amountCzk: number): number {
  return Math.round((amountCzk || 0) * 100);
}

export function centsToCzk(amountCents: number): number {
  return (amountCents || 0) / 100;
}

export function formatCzk(amountCzk: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(amountCzk || 0);
}
