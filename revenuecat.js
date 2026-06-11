import { useEffect } from 'react';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

const iosApiKey = 'test_KVdWdYpNXefKtlZjlIclSslSNAJ';
const androidApiKey = 'test_KVdWdYpNXefKtlZjlIclSslSNAJ';

export default function RevenueCatSetup() {
  useEffect(() => {
    // Payments are not live yet. RevenueCat force-closes release builds that
    // use a test_* key, so skip configuration entirely until we have real
    // production keys. Re-enable when the paywall ships.
    const key = Platform.OS === 'ios' ? iosApiKey : androidApiKey;
    if (!key || key.startsWith('test_')) {
      console.log('RevenueCat disabled: no production API key configured.');
      return;
    }
    // Native module is unavailable in Expo Go — never let it crash the app.
    try {
      Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
      Purchases.configure({ apiKey: key });
    } catch (e) {
      console.log('RevenueCat unavailable (Expo Go?):', e?.message);
    }
  }, []);

  return null;
}

