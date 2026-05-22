export interface RewardsTier {
  id: string;
  label: string;
  points: number;
  blurb: string;
}

export interface RewardsSettings {
  enabled: boolean;
  displayToCustomers: boolean;
  pointsPerDollar: number;
  tiers: RewardsTier[];
  updatedAt: string;
}

export const DEFAULT_REWARDS_SETTINGS: RewardsSettings = {
  enabled: true,
  displayToCustomers: true,
  pointsPerDollar: 1,
  tiers: [
    {
      id: "store-credit-10",
      label: "$10 store credit",
      points: 100,
      blurb: "Apply to any AdiCon order.",
    },
    {
      id: "free-shipping",
      label: "Free domestic shipping",
      points: 250,
      blurb: "Next order, no minimum.",
    },
    {
      id: "gift-card-25",
      label: "$25 gift card",
      points: 450,
      blurb: "Use it yourself or gift it.",
    },
    {
      id: "stylist-consult",
      label: "Stylist consultation",
      points: 600,
      blurb: "30-minute video session.",
    },
  ],
  updatedAt: new Date(0).toISOString(),
};
