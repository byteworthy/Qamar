import AsyncStorage from "@react-native-async-storage/async-storage";

export type BillingTier = "free" | "plus" | "pro";
export type BillingStatus = "free" | "active" | "past_due" | "canceled";

export interface BillingProfile {
  tier: BillingTier;
  status: BillingStatus;
  planName: string;
  updatedAt: number;
}

export interface BillingProvider {
  getProfile: () => Promise<BillingProfile>;
  purchase: (
    tier: BillingTier,
    period: "monthly" | "yearly",
  ) => Promise<BillingProfile>;
  restore: () => Promise<BillingProfile>;
  manage: () => Promise<void>;
}

export const BILLING_QUERY_KEY = ["billing-profile"];
export const USE_MOCK_BILLING = true;

const MOCK_PROFILE_KEY = "@noor_mock_billing_profile";

const defaultProfile: BillingProfile = {
  tier: "free",
  status: "free",
  planName: "Free",
  updatedAt: Date.now(),
};

const getPlanName = (tier: BillingTier) => {
  if (tier === "pro") return "Noor Pro";
  if (tier === "plus") return "Noor Plus";
  return "Free";
};

class MockBillingProvider implements BillingProvider {
  async getProfile(): Promise<BillingProfile> {
    const stored = await AsyncStorage.getItem(MOCK_PROFILE_KEY);
    if (!stored) return defaultProfile;
    try {
      const parsed = JSON.parse(stored) as BillingProfile;
      return { ...defaultProfile, ...parsed };
    } catch (error) {
      return defaultProfile;
    }
  }

  async purchase(
    tier: BillingTier,
    period: "monthly" | "yearly",
  ): Promise<BillingProfile> {
    const status: BillingStatus = tier === "free" ? "free" : "active";
    const updatedProfile: BillingProfile = {
      tier,
      status,
      planName: getPlanName(tier),
      updatedAt: Date.now(),
    };
    await AsyncStorage.setItem(
      MOCK_PROFILE_KEY,
      JSON.stringify(updatedProfile),
    );
    return updatedProfile;
  }

  async restore(): Promise<BillingProfile> {
    return this.getProfile();
  }

  async manage(): Promise<void> {
    return;
  }
}

class StoreBillingProvider implements BillingProvider {
  async getProfile(): Promise<BillingProfile> {
    return defaultProfile;
  }

  async purchase(): Promise<BillingProfile> {
    throw new Error("Store billing not configured yet.");
  }

  async restore(): Promise<BillingProfile> {
    throw new Error("Store billing not configured yet.");
  }

  async manage(): Promise<void> {
    throw new Error("Store billing not configured yet.");
  }
}

const billingProvider: BillingProvider = USE_MOCK_BILLING
  ? new MockBillingProvider()
  : new StoreBillingProvider();

export const getBillingProfile = () => billingProvider.getProfile();
export const purchaseTier = (tier: BillingTier, period: "monthly" | "yearly") =>
  billingProvider.purchase(tier, period);
export const restorePurchases = () => billingProvider.restore();
export const openManageSubscriptions = () => billingProvider.manage();

export const isPaidTier = (tier: BillingTier) =>
  tier === "plus" || tier === "pro";
export const isProTier = (tier: BillingTier) => tier === "pro";
