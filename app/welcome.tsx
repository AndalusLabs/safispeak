// moet bovenaan
import { MotiImage } from 'moti';
import 'react-native-reanimated';

import { commonStyles } from '@/styles/common';
import { logoAnimation } from '@/styles/commonAnimations';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const safiLogo = require('@/assets/images/logo_new_black.png');

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const safeTop = insets?.top || 50;

  const handleGetStarted = () => {
    router.push('/onboarding-flow');
  };

  const handleSignIn = () => {
    router.push('/lesson');
  };

  return (
    <View style={styles.container}>
      {/* Main content */}
      <View style={[styles.content, { paddingTop: safeTop + 40 }]}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.logoContainer}>
          <MotiImage
            source={safiLogo}
            style={commonStyles.logoImage}
            resizeMode="contain"
            from={logoAnimation.from}
            animate={logoAnimation.animate}
            transition={logoAnimation.transition}
          />
          </View>
        </View>

        {/* Text content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>SafiSpeak</Text>
          <Text style={styles.subtitle}>Say it the Darija way!</Text>
        </View>
      </View>

      {/* Bottom buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
          <Text style={styles.getStartedButtonText}>GET STARTED</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
          <Text style={styles.signInButtonText}>I ALREADY HAVE AN ACCOUNT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff9e9' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  illustrationContainer: { alignItems: 'center', marginBottom: 60 },
  logoContainer: { marginBottom: 40 },
  logoImage: { width: 260, height: 260, resizeMode: 'contain' },

  textContainer: { alignItems: 'center' },
  title: {
    fontSize: 42,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#00A86B',
    marginBottom: 10,
    letterSpacing: -1,
  },
  subtitle: { fontSize: 18, fontFamily: 'Nunito_400Regular', color: '#777777', textAlign: 'center' },

  buttonContainer: { paddingHorizontal: 30, paddingBottom: 40 },
  getStartedButton: {
    backgroundColor: '#00A86B',
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  getStartedButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  signInButton: {
    paddingVertical: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    backgroundColor: 'white',
  },
  signInButtonText: {
    color: '#1CB0F6',
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
