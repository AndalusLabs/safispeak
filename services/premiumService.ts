import AsyncStorage from '@react-native-async-storage/async-storage';

const PREMIUM_ACCESS_KEY = 'safispeak_premium_access';

export async function setPremiumUnlocked(enabled: boolean) {
  try {
    await AsyncStorage.setItem(PREMIUM_ACCESS_KEY, enabled ? 'true' : 'false');
  } catch (error) {
    console.warn('Failed to persist premium state:', error);
  }
}

export async function isPremiumUnlocked(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(PREMIUM_ACCESS_KEY);
    return value === 'true';
  } catch (error) {
    console.warn('Failed to read premium state:', error);
    return false;
  }
}

export async function clearPremiumUnlocked() {
  try {
    await AsyncStorage.removeItem(PREMIUM_ACCESS_KEY);
  } catch (error) {
    console.warn('Failed to clear premium state:', error);
  }
}

