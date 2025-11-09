import LottieView from 'lottie-react-native';
import React from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface FlashcardData {
  darija: string;
  translation: string;
}

interface FlashcardProps {
  card: FlashcardData;
  isPlaying: boolean;
  onFlip: () => void;
  onPlayAudio: () => void;
  flipAnimation: Animated.Value;
}

const Flashcard: React.FC<FlashcardProps> = ({
  card,
  isPlaying,
  onFlip,
  onPlayAudio,
  flipAnimation,
}) => {
  return (
    <TouchableOpacity
      style={styles.flashcard}
      onPress={onFlip}
      activeOpacity={0.9}
    >
      <Animated.View
        style={[
          styles.flashcardSide,
          styles.flashcardFront,
          {
            transform: [
              {
                rotateY: flipAnimation.interpolate({
                  inputRange: [0, 180],
                  outputRange: ['0deg', '180deg'],
                }),
              },
            ],
          },
        ]}
      >
        {/* Pattern Background */}
        <View style={styles.flashcardPatternBackground}>
          <View style={styles.flashcardPatternCircle1} />
          <View style={styles.flashcardPatternCircle2} />
          <View style={styles.flashcardPatternCircle3} />
          <View style={styles.flashcardPatternCircle4} />
        </View>
        
        <View style={styles.flashcardContent}>
          <Text style={styles.flashcardText}>
            {card.darija}
          </Text>
          
          {/* Microphone Button */}
          <TouchableOpacity 
            onPress={onPlayAudio} 
            style={styles.flashcardSpeakerButton}
          >
            <LottieView
              source={
                isPlaying 
                  ? require('@/assets/animations/Playing.json')
                  : require('@/assets/animations/Speaker Icon.json')
              }
              autoPlay
              loop={true}
              style={styles.flashcardSpeakerAnimation}
            />
          </TouchableOpacity>
          
          <Text style={styles.flashcardHint}>
            Tap to reveal translation
          </Text>
        </View>
      </Animated.View>
      
      <Animated.View
        style={[
          styles.flashcardSide,
          styles.flashcardBack,
          {
            transform: [
              {
                rotateY: flipAnimation.interpolate({
                  inputRange: [0, 180],
                  outputRange: ['180deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      >
        {/* Pattern Background */}
        <View style={styles.flashcardPatternBackground}>
          <View style={styles.flashcardPatternCircle1} />
          <View style={styles.flashcardPatternCircle2} />
          <View style={styles.flashcardPatternCircle3} />
          <View style={styles.flashcardPatternCircle4} />
        </View>
        
        <View style={styles.flashcardContent}>
          <Text style={styles.flashcardText}>
            {card.translation}
          </Text>
          <Text style={styles.flashcardHint}>
            Tap to flip back
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  flashcard: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  flashcardSide: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backfaceVisibility: 'hidden',
  },
  flashcardFront: {
    backgroundColor: 'transparent', // Transparent since we use SVG
  },
  flashcardBack: {
    backgroundColor: 'transparent', // Transparent since we use SVG
    transform: [{ rotateY: '180deg' }],
  },
  flashcardContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  flashcardText: {
    fontSize: 32,
    fontFamily: 'Baloo2-Bold',
    color: '#1F2937', // Dark gray for better contrast on yellow
    textAlign: 'center',
    marginBottom: 20,
  },
  flashcardHint: {
    fontSize: 18,
    fontFamily: 'Baloo2-Medium',
    color: '#4B5563', // Medium gray for hints
    textAlign: 'center',
    opacity: 0.8,
  },
  flashcardSpeakerButton: {
    marginVertical: 15,
    padding: 10,
  },
  flashcardSpeakerAnimation: {
    width: 60,
    height: 60,
  },
  flashcardPatternBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#FCD34D',
    borderRadius: 20,
    overflow: 'hidden',
  },
  flashcardPatternCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: -50,
    left: -50,
  },
  flashcardPatternCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    top: '50%',
    right: -60,
    transform: [{ translateY: -60 }],
  },
  flashcardPatternCircle3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    bottom: -20,
    left: -20,
  },
  flashcardPatternCircle4: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: -70,
    right: -70,
  },
});

export default Flashcard;


