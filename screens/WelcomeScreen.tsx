import { MotiImage } from 'moti';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  username: string;
  score: number;
  onContinue: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ username, score, onContinue }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back!</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Moving Mascot */}
        <View style={styles.mascotContainer}>
          <MotiImage
            source={require('@/assets/images/logo_new_black.png')}
            style={styles.mascot}
            from={{
              translateY: 0,
              scale: 1,
            }}
            animate={{
              translateY: [0, -10, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              type: 'timing',
              duration: 2000,
              loop: true,
            }}
          />
        </View>

        {/* Speech Bubble */}
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>
            Hi {username}!{'\n'}
            You have {score * 10} XP!{'\n'}
            Let's continue with the lesson!
          </Text>
          <View style={styles.speechTail} />
          <View style={styles.speechTailBorder} />
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
          <Text style={styles.continueButtonText}>Continue with lesson</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Baloo2-Bold',
    color: '#00A86B',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  mascotContainer: {
    marginBottom: 40,
  },
  mascot: {
    width: 120,
    height: 120,
  },
  speechBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 40,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  speechText: {
    fontSize: 18,
    fontFamily: 'Baloo2-Medium',
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
  },
  speechTail: {
    position: 'absolute',
    bottom: -10,
    left: '55%',
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
    marginLeft: -7,
  },
  speechTailBorder: {
    position: 'absolute',
    bottom: -11,
    left: '55%',
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 11,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#E0E0E0',
    marginLeft: -8,
  },
  continueButton: {
    backgroundColor: '#00A86B',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Baloo2-Bold',
    textAlign: 'center',
  },
});

export default WelcomeScreen;


