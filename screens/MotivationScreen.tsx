import { MotiImage } from 'moti';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface MotivationScreenProps {
  title: string;
  message: string;
  buttonText: string;
  progress: number; // 1, 2, or 3
  onContinue: () => void;
}

const MotivationScreen: React.FC<MotivationScreenProps> = ({
  title,
  message,
  buttonText,
  progress,
  onContinue,
}) => {
  return (
    <View style={styles.container}>
      {/* Header with Progress */}
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{title}</Text>
          <View style={styles.motivationProgressBar}>
            <View
              style={[
                styles.motivationProgressFill,
                { width: `${(progress / 3) * 100}%` },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Dancing Mascot */}
        <View style={styles.mascotContainer}>
          <MotiImage
            source={require('@/assets/images/logo_new_black.png')}
            style={styles.mascot}
            from={{
              rotate: '0deg',
              scale: 1,
            }}
            animate={{
              rotate: ['0deg', '10deg', '-10deg', '0deg'],
              scale: [1, 1.1, 1],
            }}
            transition={{
              type: 'timing',
              duration: 1000,
              loop: true,
            }}
          />
        </View>

        {/* Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{message}</Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
          <Text style={styles.continueButtonText}>{buttonText}</Text>
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 24,
    fontFamily: 'Baloo2-Bold',
    color: '#00A86B',
    textAlign: 'center',
    marginBottom: 10,
  },
  motivationProgressBar: {
    width: '80%',
    height: 6,
    backgroundColor: '#E5E5E5',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
  },
  motivationProgressFill: {
    height: '100%',
    backgroundColor: '#00A86B',
    borderRadius: 4,
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
  messageContainer: {
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  messageText: {
    fontSize: 20,
    fontFamily: 'Baloo2-Medium',
    color: '#333',
    textAlign: 'center',
    lineHeight: 28,
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

export default MotivationScreen;


