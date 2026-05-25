export interface StoreProfileSettings {
  brandName: string;
  supportEmail: string;
  /** ISO 4217 currency code (e.g. "USD"). */
  currency: string;
  updatedAt: string;
}

export const DEFAULT_STORE_PROFILE_SETTINGS: StoreProfileSettings = {
  brandName: "Adicon Collections",
  supportEmail: "support@adicon.com",
  currency: "USD",
  updatedAt: new Date(0).toISOString(),
};
