export interface AdminSignupSettings {
  enabled: boolean;
  inviteCode: string;
  updatedAt: string;
}

export const DEFAULT_ADMIN_SIGNUP_SETTINGS: AdminSignupSettings = {
  enabled: false,
  inviteCode: "",
  updatedAt: new Date(0).toISOString(),
};
