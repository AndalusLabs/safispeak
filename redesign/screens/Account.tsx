/* SafiSpeak redesign — Account & backup slide-over.
   Anonymous users: attach an email (6-digit code) so progress + purchases
   survive device changes. Signed-in users: see their email, sync, sign out. */

import React from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS, useAnimatedStyle, useSharedValue, withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, motion, radius } from '../theme';
import { haptic, sfx } from '../sfx';
import { Account, getAccount, requestEmailCode, signOutToAnonymous, verifyEmailCode } from '../auth';
import { rcLogIn } from '../monetization';
import Icon from '../components/Icon';
import Safi from '../components/Safi';
import { AppButton, RoundBtn } from '../components/ui';

type Stage = 'info' | 'code';

export function AccountScreen({ width, onBack, onSynced }: {
  width: number;
  onBack: () => void;
  onSynced: () => void; // parent pushes local progress + refreshes premium
}) {
  const insets = useSafeAreaInsets();
  const enter = useSharedValue(width);
  const dx = useSharedValue(0);

  const [account, setAccount] = React.useState<Account | null>(null);
  const [stage, setStage] = React.useState<Stage>('info');
  const [email, setEmail] = React.useState('');
  const [code, setCode] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    enter.value = withTiming(0, motion.spring);
    getAccount().then(setAccount);
  }, [enter]);

  const dismiss = React.useCallback(() => {
    enter.value = withTiming(width, { duration: 240 });
    setTimeout(onBack, 230);
  }, [enter, width, onBack]);

  const pan = Gesture.Pan()
    .activeOffsetX(10)
    .failOffsetY([-12, 12])
    .onUpdate((e) => { dx.value = Math.max(0, e.translationX); })
    .onEnd((e) => {
      if (e.translationX > 90 || e.velocityX > 500) {
        runOnJS(dismiss)();
      } else {
        dx.value = withTiming(0, motion.spring);
      }
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: enter.value + dx.value }],
  }));

  const sendCode = async () => {
    const e = email.trim();
    if (busy || !/^\S+@\S+\.\S+$/.test(e)) {
      if (!busy) Alert.alert('Email', 'Please enter a valid email address.');
      return;
    }
    setBusy(true);
    const res = await requestEmailCode(e);
    setBusy(false);
    if (res.ok) {
      sfx('tap');
      haptic('light');
      setStage('code');
    } else {
      Alert.alert('Could not send the code', res.message);
    }
  };

  const verify = async () => {
    if (busy || code.trim().length < 6) return;
    setBusy(true);
    const res = await verifyEmailCode(email, code);
    if (res.ok) {
      const acc = await getAccount();
      setAccount(acc);
      if (acc) rcLogIn(acc.id);
      onSynced();
      setBusy(false);
      setStage('info');
      sfx('win');
      haptic('success');
      Alert.alert('Saved!', 'Your progress is now linked to your email.');
    } else {
      setBusy(false);
      Alert.alert('Verification', res.message);
    }
  };

  const signOut = () => {
    Alert.alert(
      'Sign out?',
      'Your progress stays on this phone and in your email account. This device continues as a guest.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out', style: 'destructive',
          onPress: async () => {
            const acc = await signOutToAnonymous();
            setAccount(acc);
            if (acc) rcLogIn(acc.id);
          },
        },
      ],
    );
  };

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.screen, style]}>
        <View style={[styles.top, { marginTop: insets.top + 8 }]}>
          <RoundBtn icon="chevL" onPress={dismiss} />
          <View style={styles.topMid}>
            <Text style={styles.topTitle}>Account &amp; backup</Text>
          </View>
          <View style={{ width: 38 }} />
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <Safi expression={account?.email ? 'happy' : 'idle'} animation="bob" size={104} />

            {account?.email ? (
              /* signed in */
              <>
                <Text style={styles.title}>Progress backed up</Text>
                <Text style={styles.body}>
                  Your lessons, streak and subscription are linked to{'\n'}
                  <Text style={styles.em}>{account.email}</Text>
                </Text>
                <View style={styles.badge}>
                  <Icon name="check" size={15} color={colors.brand} />
                  <Text style={styles.badgeText}>Synced to the cloud</Text>
                </View>
                <Pressable onPress={signOut} style={styles.linkBtn}>
                  <Text style={styles.linkText}>Sign out on this device</Text>
                </Pressable>
              </>
            ) : stage === 'info' ? (
              /* anonymous — offer backup */
              <>
                <Text style={styles.title}>Save your progress</Text>
                <Text style={styles.body}>
                  You’re learning as a guest. Add your email so your lessons,
                  streak and subscription survive a new phone.
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor={colors.sand400}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
                <AppButton style={{ alignSelf: 'stretch' }} onPress={sendCode}>
                  {busy ? 'Sending…' : 'Send me a code'}
                </AppButton>
                {account === null && (
                  <Text style={styles.hint}>
                    Offline right now — your progress is safe on this phone and
                    will back up when you’re connected.
                  </Text>
                )}
              </>
            ) : (
              /* enter the 6-digit code */
              <>
                <Text style={styles.title}>Check your email</Text>
                <Text style={styles.body}>
                  We sent a 6-digit code to{'\n'}<Text style={styles.em}>{email.trim()}</Text>
                </Text>
                <TextInput
                  style={[styles.input, styles.codeInput]}
                  placeholder="······"
                  placeholderTextColor={colors.sand400}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={code}
                  onChangeText={setCode}
                />
                <AppButton style={{ alignSelf: 'stretch' }} onPress={verify}>
                  {busy ? 'Checking…' : 'Verify & save'}
                </AppButton>
                <Pressable onPress={() => setStage('info')} style={styles.linkBtn} disabled={busy}>
                  {busy
                    ? <ActivityIndicator size="small" color={colors.brand} />
                    : <Text style={styles.linkText}>Use a different email</Text>}
                </Pressable>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.appBg,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  topMid: {
    flex: 1,
    alignItems: 'center',
  },
  topTitle: {
    fontFamily: font.extra,
    fontSize: 17,
    color: colors.ink900,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingBottom: 40,
    gap: 6,
  },
  title: {
    fontFamily: font.extra,
    fontSize: 24,
    color: colors.ink900,
    marginTop: 12,
    textAlign: 'center',
  },
  body: {
    fontFamily: font.semibold,
    fontSize: 14.5,
    lineHeight: 21,
    color: colors.ink600,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  em: {
    fontFamily: font.extra,
    color: colors.brand,
  },
  input: {
    alignSelf: 'stretch',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.optionBorder,
    backgroundColor: colors.card,
    fontFamily: font.bold,
    fontSize: 16,
    color: colors.ink900,
    textAlign: 'center',
    marginBottom: 12,
  },
  codeInput: {
    fontSize: 26,
    letterSpacing: 10,
    fontFamily: font.extra,
  },
  hint: {
    fontFamily: font.semibold,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.sand600,
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 300,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.greenTint,
    borderRadius: radius.pill,
    paddingVertical: 9,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  badgeText: {
    fontFamily: font.extra,
    fontSize: 13.5,
    color: colors.brand,
  },
  linkBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  linkText: {
    fontFamily: font.bold,
    fontSize: 13.5,
    color: colors.sand600,
    textDecorationLine: 'underline',
  },
});
