import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '../contexts/AuthContext';
import RevenueCatSetup from '../revenuecat';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    'Baloo2-Regular': require('../assets/fonts/Baloo2-Regular.ttf'),
    'Baloo2-Medium': require('../assets/fonts/Baloo2-Medium.ttf'),
    'Baloo2-SemiBold': require('../assets/fonts/Baloo2-SemiBold.ttf'),
    'Baloo2-Bold': require('../assets/fonts/Baloo2-Bold.ttf'),
    'Baloo2-ExtraBold': require('../assets/fonts/Baloo2-ExtraBold.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <RevenueCatSetup />
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="welcome" options={{ headerShown: false }} />
              <Stack.Screen name="onboarding-flow" options={{ headerShown: false }} />
              <Stack.Screen name="lesson-overview" options={{ headerShown: false }} />
              <Stack.Screen name="my-profile" options={{ headerShown: false }} />
              <Stack.Screen name="account-prompt" options={{ headerShown: false }} />
              <Stack.Screen name="lessons/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          </ThemeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
