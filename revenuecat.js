import { useEffect } from 'react';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

const iosApiKey = 'test_KVdWdYpNXefKtlZjlIclSslSNAJ';
const androidApiKey = 'test_KVdWdYpNXefKtlZjlIclSslSNAJ';

export default function RevenueCatSetup() {
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: iosApiKey });
    } else if (Platform.OS === 'android') {
      Purchases.configure({ apiKey: androidApiKey });
    }
  }, []);

  return null;
}

