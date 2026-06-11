import React from 'react';
import 'react-native-reanimated';

import App from '@/redesign/App';
import { AppStoreProvider } from '@/redesign/store';

/* SafiSpeak v2 — the swipe-first redesign is the app's root experience. */
export default function Index() {
  return (
    <AppStoreProvider>
      <App />
    </AppStoreProvider>
  );
}
