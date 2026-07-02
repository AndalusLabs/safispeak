/* SafiSpeak redesign — RevenueCat wrapper for the hard paywall.
   Lesson 1 is free; everything after requires the monthly subscription.

   ⚠️ KEYS: the real production keys live in Ayoub's RevenueCat account
   (andalus.tech.2025@gmail.com). Until they are pasted below, the module runs
   in "not configured" mode: the paywall UI works, and in DEV a purchase is
   simulated so the flow can be tested end-to-end. Never commit real keys —
   move them to app config / env before release if possible.

   The old integration force-closed release builds when RevenueCat was
   misconfigured, so every call here is guarded: a monetization failure must
   never crash the app. */

import { Platform } from 'react-native';

const RC_API_KEY_IOS = 'REPLACE_WITH_REVENUECAT_IOS_KEY';
const RC_API_KEY_ANDROID = 'REPLACE_WITH_REVENUECAT_ANDROID_KEY';

/** Entitlement that unlocks the app (must match the RevenueCat dashboard). */
const ENTITLEMENT_ID = 'premium';

export type PaywallPrice = { priceString: string; period: 'month' };

const PLACEHOLDER = 'REPLACE_WITH';

function apiKey(): string {
  return Platform.OS === 'ios' ? RC_API_KEY_IOS : RC_API_KEY_ANDROID;
}

export function isConfigured(): boolean {
  return !apiKey().startsWith(PLACEHOLDER);
}

/* Loaded lazily so a missing/broken native module can never take the
   whole app down (e.g. running in Expo Go). */
function rc(): any | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react-native-purchases').default;
  } catch {
    return null;
  }
}

let initialized = false;

/** Call once at startup. No-op unless real keys are present. */
export async function initPurchases(): Promise<void> {
  if (initialized || !isConfigured()) return;
  const Purchases = rc();
  if (!Purchases) return;
  try {
    Purchases.configure({ apiKey: apiKey() });
    initialized = true;
  } catch {
    // never crash on monetization setup
  }
}

/** True if the user already owns the entitlement (e.g. reinstalled app). */
export async function checkPremium(): Promise<boolean> {
  if (!isConfigured()) return false;
  const Purchases = rc();
  if (!Purchases) return false;
  try {
    await initPurchases();
    const info = await Purchases.getCustomerInfo();
    return !!info?.entitlements?.active?.[ENTITLEMENT_ID];
  } catch {
    return false;
  }
}

/** Monthly price for the paywall UI (falls back to a static label). */
export async function getMonthlyPrice(): Promise<PaywallPrice> {
  const fallback: PaywallPrice = { priceString: '€4.99', period: 'month' };
  if (!isConfigured()) return fallback;
  const Purchases = rc();
  if (!Purchases) return fallback;
  try {
    await initPurchases();
    const offerings = await Purchases.getOfferings();
    const pkg = offerings?.current?.monthly ?? offerings?.current?.availablePackages?.[0];
    const priceString = pkg?.product?.priceString;
    return priceString ? { priceString, period: 'month' } : fallback;
  } catch {
    return fallback;
  }
}

export type PurchaseResult = { ok: true } | { ok: false; cancelled?: boolean; message?: string };

/** Buy the monthly package. In DEV without keys, simulates success. */
export async function purchaseMonthly(): Promise<PurchaseResult> {
  if (!isConfigured()) {
    if (__DEV__) return { ok: true }; // let the flow be tested before keys arrive
    return { ok: false, message: 'Purchases are not available yet. Please try again later.' };
  }
  const Purchases = rc();
  if (!Purchases) return { ok: false, message: 'Purchases module unavailable.' };
  try {
    await initPurchases();
    const offerings = await Purchases.getOfferings();
    const pkg = offerings?.current?.monthly ?? offerings?.current?.availablePackages?.[0];
    if (!pkg) return { ok: false, message: 'No subscription is configured yet.' };
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    if (customerInfo?.entitlements?.active?.[ENTITLEMENT_ID]) return { ok: true };
    return { ok: false, message: 'Purchase did not unlock the subscription.' };
  } catch (e: any) {
    if (e?.userCancelled) return { ok: false, cancelled: true };
    return { ok: false, message: e?.message ?? 'Purchase failed.' };
  }
}

/** Restore purchases (required by the app stores). */
export async function restorePurchases(): Promise<PurchaseResult> {
  if (!isConfigured()) {
    return { ok: false, message: __DEV__ ? 'Nothing to restore (dev mode).' : 'Restore is not available yet.' };
  }
  const Purchases = rc();
  if (!Purchases) return { ok: false, message: 'Purchases module unavailable.' };
  try {
    await initPurchases();
    const info = await Purchases.restorePurchases();
    if (info?.entitlements?.active?.[ENTITLEMENT_ID]) return { ok: true };
    return { ok: false, message: 'No previous subscription found.' };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? 'Restore failed.' };
  }
}
