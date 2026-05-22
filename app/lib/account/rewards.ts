import "server-only";

import { getSessionUser } from "@/app/lib/auth/server";
import { getOrderRepository } from "@/app/lib/orders/order-repository";
import { getRewardsSettings } from "@/app/lib/settings/rewards/actions";
import type { RewardsSettings } from "@/app/lib/settings/rewards/types";

export interface RewardsSummary {
  balance: number;
  lifetimeSpentCents: number;
  settings: RewardsSettings;
  visibleToUser: boolean;
}

export async function getRewardsSummary(): Promise<RewardsSummary> {
  const settings = await getRewardsSettings();
  const visibleToUser = settings.enabled && settings.displayToCustomers;
  const user = await getSessionUser();
  if (!user) {
    return { balance: 0, lifetimeSpentCents: 0, settings, visibleToUser };
  }
  const repo = await getOrderRepository();
  const orders = await repo.list({ userId: user.id });
  const lifetimeSpentCents = orders.reduce((sum, order) => {
    if (order.status === "cancelled") return sum;
    return sum + (order.totals?.total ?? order.total ?? 0);
  }, 0);
  const balance = settings.enabled
    ? Math.floor((lifetimeSpentCents / 100) * settings.pointsPerDollar)
    : 0;
  return { balance, lifetimeSpentCents, settings, visibleToUser };
}
