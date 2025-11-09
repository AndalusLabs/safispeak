import { Audio } from 'expo-av';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import { MotiImage } from 'moti';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const safiLogo = require('@/assets/images/logo_new_black.png');

export default function IntroScreen() {
  const insets = useSafeAreaInsets();
  const safeTop = insets?.top || 50;

  useEffect(() => {
    let sound: Audio.Sound | null = null;

    const playStartSound = async () => {
      try {
        // Load and play the start sound
        const { sound: audioSound } = await Audio.Sound.createAsync(
          require('@/assets/sounds/start_sound.mp3')
        );
        sound = audioSound;
        
        // Play the sound
        await sound.playAsync();
      } catch (error) {
        console.log('Error playing sound:', error);
      }
    };

    // Play sound immediately when component mounts
    playStartSound();

    // Auto-navigate to welcome screen after 3 seconds
    const timer = setTimeout(async () => {
      // Stop the sound before navigation
      if (sound) {
        try {
          await sound.stopAsync();
          await sound.unloadAsync();
        } catch (error) {
          console.log('Error stopping sound:', error);
        }
      }
      
      router.replace('/welcome');
    }, 3000);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <MotiImage
            source={safiLogo}
            style={styles.logoImage}
            resizeMode="contain"
            from={{
              translateY: 0,
              scale: 0.8,
              opacity: 0.7,
            }}
            animate={{
              translateY: -15,
              scale: 1,
              opacity: 1,
            }}
            transition={{
              type: 'timing',
              duration: 2000,
              loop: true,
              repeatReverse: true,
            }}
          />
        </View>
        
        {/* Lottie dots loader animation */}
        <View style={styles.lottieContainer}>
          <LottieView
            source={require('@/assets/animations/Dots loader.json')}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start', // begin bovenaan
    alignItems: 'center',
    paddingTop: height * 0.2, // 20% van de schermhoogte → logo staat hoger
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20, // Verminder margin om ruimte te maken voor Lottie
  },
  logoImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  lottieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieAnimation: {
    width: 120,
    height: 120,
  },
});

