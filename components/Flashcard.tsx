import FlashcardPattern from '@/assets/images/flashcard-pattern.svg';
import LottieView from 'lottie-react-native';
import React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
    <View style={styles.flashcard}>
      <TouchableOpacity
        style={styles.flashcardTouchable}
        onPress={onFlip}
        activeOpacity={0.9}
      >
        {/* Front Side */}
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
          <View style={styles.flashcardPatternBackground}>
            <View style={styles.svgWrapper}>
              <FlashcardPattern width="100%" height="100%" />
            </View>
          </View>
          
          <View style={styles.flashcardContent}>
            <Text style={styles.flashcardText}>{card.darija}</Text>
            <Text style={styles.flashcardHint}>Tap to reveal translation</Text>
          </View>
        </Animated.View>
        
        {/* Back Side */}
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
          <View style={styles.flashcardPatternBackground}>
            <View style={styles.svgWrapper}>
              <FlashcardPattern width="100%" height="100%" />
            </View>
          </View>
          
          <View style={styles.flashcardContent}>
            <Text style={styles.flashcardText}>{card.translation}</Text>
            <Text style={styles.flashcardHint}>Tap to flip back</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
      
      {/* Microphone Button */}
      <View style={styles.flashcardMicrophoneContainer} pointerEvents="box-none">
        <TouchableOpacity 
          onPress={onPlayAudio}
          style={styles.flashcardSpeakerButton}
          activeOpacity={0.7}
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flashcard: {
    width: '88%',
    aspectRatio: 0.7,
    borderRadius: 80, // Very rounded corners on all sides - increased for better side rounding
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    overflow: 'hidden',
  },
  flashcardTouchable: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  flashcardSide: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 80, // Match flashcard borderRadius
    backfaceVisibility: 'hidden',
  },
  flashcardFront: {
    backgroundColor: 'transparent',
  },
  flashcardBack: {
    backgroundColor: 'transparent',
    transform: [{ rotateY: '180deg' }],
  },
  flashcardPatternBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 80, // Match flashcard borderRadius
    overflow: 'hidden',
  },
  svgWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 80, // Ensure SVG respects rounded corners
    overflow: 'hidden',
  },
  flashcardContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 30,
    paddingTop: 50,
    paddingBottom: 30,
  },
  flashcardText: {
    fontSize: 32,
    fontFamily: 'Baloo2-Bold',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 20,
  },
  flashcardHint: {
    fontSize: 14,
    fontFamily: 'Baloo2-Medium',
    color: '#4B5563',
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 20,
  },
  flashcardMicrophoneContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  flashcardSpeakerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashcardSpeakerAnimation: {
    width: 40,
    height: 40,
  },
});

export default Flashcard;
