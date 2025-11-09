import React, { useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Flashcard from '../components/Flashcard';

const { width, height } = Dimensions.get('window');

interface FlashcardData {
  darija: string;
  translation: string;
}

interface FlashcardScreenProps {
  flashcards: FlashcardData[];
  currentCardIndex: number;
  onNext: () => void;
  onPrevious: () => void;
  onBack: () => void;
  onPlayAudio: () => void;
  isPlaying: boolean;
}

const FlashcardScreen: React.FC<FlashcardScreenProps> = ({
  flashcards,
  currentCardIndex,
  onNext,
  onPrevious,
  onBack,
  onPlayAudio,
  isPlaying,
}) => {
  const safeTop = useSafeAreaInsets().top;
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const currentCard = flashcards[currentCardIndex];

  const handleCardFlip = () => {
    const toValue = isCardFlipped ? 0 : 180;
    setIsCardFlipped(!isCardFlipped);
    
    Animated.timing(flipAnimation, {
      toValue,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const handleNextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setIsCardFlipped(false);
      flipAnimation.setValue(0);
      onNext();
    }
  };

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setIsCardFlipped(false);
      flipAnimation.setValue(0);
      onPrevious();
    }
  };

  const handleSwipeGesture = ({ nativeEvent }: any) => {
    if (nativeEvent.state === State.END) {
      if (nativeEvent.translationX > 50) {
        // Swipe right - next card
        handleNextCard();
      } else if (nativeEvent.translationX < -50) {
        // Swipe left - previous card
        handlePreviousCard();
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: safeTop + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.flashcardProgressContainer}>
          <Text style={styles.progressText}>
            Flashcard {currentCardIndex + 1} of {flashcards.length}
          </Text>
          <View style={styles.motivationProgressBar}>
            <View
              style={[
                styles.motivationProgressFill,
                { width: `${((currentCardIndex + 1) / flashcards.length) * 100}%` },
              ]}
            />
          </View>
        </View>
        <View style={styles.placeholderSpace} />
      </View>

      {/* Flashcard Container */}
      <View style={styles.flashcardScreenContainer}>
        <GestureHandlerRootView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={styles.flashcardWrapper}>
            <PanGestureHandler onHandlerStateChange={handleSwipeGesture}>
              <View>
                <Flashcard
                  card={currentCard}
                  isPlaying={isPlaying}
                  onFlip={handleCardFlip}
                  onPlayAudio={onPlayAudio}
                  flipAnimation={flipAnimation}
                />
              </View>
            </PanGestureHandler>
          </View>
        </GestureHandlerRootView>
        
        {/* Swipe Instructions */}
        <View style={styles.swipeInstruction}>
          <Text style={styles.swipeInstructionText}>
            Swipe left for previous • Swipe right for next
          </Text>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backIcon: {
    fontSize: 20,
    color: '#333',
    fontFamily: 'Baloo2-Medium',
  },
  flashcardProgressContainer: {
    flex: 1,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 18,
    fontFamily: 'Baloo2-Bold',
    color: '#00A86B',
    textAlign: 'center',
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
  placeholderSpace: {
    width: 40,
  },
  flashcardScreenContainer: {
    flex: 1,
    width: '100%',
  },
  flashcardWrapper: {
    width: width * 0.8,
    height: height * 0.5,
  },
  swipeInstruction: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  swipeInstructionText: {
    fontSize: 16,
    fontFamily: 'Baloo2-Medium',
    color: '#666',
    textAlign: 'center',
  },
});

export default FlashcardScreen;


