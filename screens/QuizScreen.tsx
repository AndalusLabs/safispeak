import { Audio } from 'expo-av';
import LottieView from 'lottie-react-native';
import React, { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface Question {
  id: number;
  stimulus: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface Word {
  id: number;
  darija: string;
  audio_file: string;
}

interface Phrase {
  id: number;
  darija: string;
  audio_file: string;
}

interface QuizScreenProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (selectedIndex: number) => void;
  onNext: () => void;
  onBack: () => void;
  onPlayStimulus: () => void;
  onPlayDarijaAudio: (darijaText: string) => Promise<void>;
  words: Word[];
  phrases: Phrase[];
  isPlaying: boolean;
}

const QuizScreen: React.FC<QuizScreenProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onNext,
  onBack,
  onPlayStimulus,
  onPlayDarijaAudio,
  words,
  phrases,
  isPlaying,
}) => {
  const safeTop = useSafeAreaInsets().top;
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showXP, setShowXP] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [score, setScore] = useState(0);

  const playSound = async (type: 'correct' | 'wrong') => {
    try {
      const source =
        type === 'correct'
          ? require('@/assets/sounds/correct.mp3')
          : require('@/assets/sounds/wrong.mp3');
      
      const sound = new Audio.Sound();
      await sound.loadAsync(source);
      await sound.playAsync();
      
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const handleAnswerPress = async (index: number) => {
    if (answerChecked) return;
    
    setSelectedAnswer(index);
    
    // Check if the selected answer is Darija (exists in words or phrases)
    const selectedOption = question.options[index];
    const isDarija = words.some(w => w.darija === selectedOption || w.darija.toLowerCase() === selectedOption.toLowerCase()) ||
                     phrases.some(p => p.darija === selectedOption || p.darija.toLowerCase() === selectedOption.toLowerCase());
    
    // If it's Darija, play the audio
    if (isDarija) {
      await onPlayDarijaAudio(selectedOption);
    }
  };

  const handleCheck = () => {
    if (selectedAnswer === null) return;
    
    setAnswerChecked(true);
    const correctIndex = question.correct;
    
    if (selectedAnswer === correctIndex) {
      playSound('correct');
      setXpGained(10);
      setShowXP(true);
      setScore(score + 1);
    } else {
      playSound('wrong');
    }
    
    // Show explanation regardless of correct/incorrect
    setFeedback(question.explanation);
  };

  const handleNext = () => {
    // If there's a selected answer, record it first
    if (selectedAnswer !== null) {
      onAnswer(selectedAnswer);
    }
    // Reset state for next question
    setSelectedAnswer(null);
    setAnswerChecked(false);
    setFeedback('');
    setShowXP(false);
    setXpGained(0);
    // Always call onNext to advance to next question
    onNext();
  };

  const getAnswerStyle = (index: number) => {
    if (!answerChecked) {
      return selectedAnswer === index ? styles.answerButtonSelected : styles.answerButton;
    }
    
    if (index === question.correct) {
      return styles.answerButtonCorrect;
    } else if (selectedAnswer === index && index !== question.correct) {
      return styles.answerButtonWrong;
    }
    
    return styles.answerButton;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: safeTop + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Question {questionNumber} of {totalQuestions}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(questionNumber / totalQuestions) * 100}%` },
              ]}
            />
          </View>
        </View>
        <View style={styles.placeholderSpace} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainerStyle} showsVerticalScrollIndicator={false}>
        {/* Instruction Text */}
        <Text style={styles.instructionText}>Choose the correct meaning...</Text>
        
        <View style={styles.questionContainer}>
          {/* Mascot and Speech Bubble */}
          <View style={styles.stimulusContainer}>
            <Image source={require('@/assets/images/logo_new_black.png')} style={styles.mascotImageStimulus} resizeMode="contain" fadeDuration={0} />
            
            {/* Speech Bubble */}
            <View style={styles.speechBubbleContainer}>
              <View style={styles.speechBubble}>
                <Text style={styles.speechBubbleText}>{question.stimulus}</Text>
              </View>
              <View style={styles.speechTail} />
              <View style={styles.speechTailBorder} />
            </View>
            
            {/* Speaker Button */}
            <TouchableOpacity onPress={onPlayStimulus} style={styles.speakerButton}>
              <LottieView
                source={
                  isPlaying 
                    ? require('@/assets/animations/Playing.json')
                    : require('@/assets/animations/Speaker Icon.json')
                }
                autoPlay
                loop={true}
                style={styles.speakerAnimation}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            <View style={styles.optionsRow}>
              {question.options.slice(0, 2).map((option, index) => {
                const correctIndex = question.correct;
                const isSelected = selectedAnswer === index;
                const isCorrect = isSelected && index === correctIndex && answerChecked;
                const isWrong = isSelected && index !== correctIndex && answerChecked;
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      isSelected && !answerChecked && styles.optionButtonSelected,
                      isCorrect && { backgroundColor: '#C8E6C9', borderColor: '#2ECC71' },
                      isWrong && { backgroundColor: '#F8D7DA', borderColor: '#E74C3C' },
                    ]}
                    onPress={() => handleAnswerPress(index)}
                    disabled={answerChecked}
                  >
                    <Text 
                      style={[styles.optionText, isSelected && !answerChecked && styles.optionTextSelected]}
                      numberOfLines={3}
                      ellipsizeMode="tail"
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.optionsRow}>
              {question.options.slice(2, 4).map((option, index) => {
                const actualIndex = index + 2; // Adjust index for second row
                const correctIndex = question.correct;
                const isSelected = selectedAnswer === actualIndex;
                const isCorrect = isSelected && actualIndex === correctIndex && answerChecked;
                const isWrong = isSelected && actualIndex !== correctIndex && answerChecked;
                
                return (
                  <TouchableOpacity
                    key={actualIndex}
                    style={[
                      styles.optionButton,
                      isSelected && !answerChecked && styles.optionButtonSelected,
                      isCorrect && { backgroundColor: '#C8E6C9', borderColor: '#2ECC71' },
                      isWrong && { backgroundColor: '#F8D7DA', borderColor: '#E74C3C' },
                    ]}
                    onPress={() => handleAnswerPress(actualIndex)}
                    disabled={answerChecked}
                  >
                    <Text 
                      style={[styles.optionText, isSelected && !answerChecked && styles.optionTextSelected]}
                      numberOfLines={3}
                      ellipsizeMode="tail"
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Feedback text onder de knoppen */}
          {feedback && (
            <View style={[
              styles.feedbackContainer,
              answerChecked && selectedAnswer === question.correct && styles.feedbackContainerCorrect,
              answerChecked && selectedAnswer !== question.correct && styles.feedbackContainerWrong
            ]}>
              {answerChecked && (
                <LottieView
                  source={
                    selectedAnswer === question.correct
                      ? require('@/assets/animations/correct_answer.json')
                      : require('@/assets/animations/wrong_answer.json')
                  }
                  autoPlay
                  loop={false}
                  style={styles.feedbackAnimation}
                />
              )}
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Check/Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.checkButton,
            selectedAnswer === null && !answerChecked && styles.checkButtonDisabled,
            answerChecked && selectedAnswer === question.correct && styles.checkButtonCorrect,
            answerChecked && selectedAnswer !== question.correct && styles.checkButtonWrong
          ]}
          onPress={answerChecked ? handleNext : handleCheck}
          disabled={selectedAnswer === null && !answerChecked}
        >
          <Text style={[styles.checkButtonText, selectedAnswer === null && !answerChecked && styles.checkButtonTextDisabled]}>
            {answerChecked ? (selectedAnswer === question.correct ? 'Next' : 'Got it!!') : 'Check'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#333',
    fontFamily: 'Baloo2-Medium',
  },
  placeholderSpace: {
    width: 40,
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    fontFamily: 'Baloo2-Medium',
  },
  progressBar: {
    width: '80%',
    height: 6,
    backgroundColor: '#E5E5E5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00A86B',
    borderRadius: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainerStyle: {
    paddingTop: 20,
    paddingBottom: 100,
    flexGrow: 1,
  },
  instructionText: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Baloo2-Medium',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stimulusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 80,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  mascotImageStimulus: {
    width: 80,
    height: 80,
    marginRight: 15,
  },
  speechBubbleContainer: {
    flex: 1,
    position: 'relative',
    maxWidth: '60%',
  },
  speechBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  speechBubbleText: {
    fontSize: 22,
    color: '#333',
    fontFamily: 'Baloo2-Medium',
    textAlign: 'center',
    lineHeight: 28,
  },
  speakerButton: {
    padding: 8,
    marginLeft: 10,
  },
  speakerAnimation: {
    width: 28,
    height: 28,
  },
  speechTail: {
    position: 'absolute',
    left: -14,
    top: 25,
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderRightWidth: 14,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#FFFFFF',
    zIndex: 2,
  },
  speechTailBorder: {
    position: 'absolute',
    left: -16,
    top: 24,
    width: 0,
    height: 0,
    borderTopWidth: 11,
    borderBottomWidth: 11,
    borderRightWidth: 15,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'rgba(0,0,0,0.06)',
    zIndex: 1,
  },
  optionsContainer: {
    width: '100%',
    marginTop: -20,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  optionButton: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flex: 1,
    marginHorizontal: 6,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionButtonSelected: {
    borderWidth: 2,
    borderColor: '#333',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: 'Baloo2-Medium',
    flexShrink: 1,
  },
  optionTextSelected: {
    fontWeight: '500',
    fontFamily: 'Baloo2-Medium',
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  feedbackContainerCorrect: {
    backgroundColor: '#E8F5E8',
  },
  feedbackContainerWrong: {
    backgroundColor: '#FFE8E8',
  },
  feedbackAnimation: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    fontFamily: 'Baloo2-Medium',
    color: '#666',
    lineHeight: 20,
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
  checkButton: {
    backgroundColor: '#00A86B',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonDisabled: {
    backgroundColor: '#E5E5E5',
    shadowOpacity: 0,
    elevation: 0,
  },
  checkButtonCorrect: {
    backgroundColor: '#00A86B',
  },
  checkButtonWrong: {
    backgroundColor: '#E74C3C',
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'Baloo2-Bold',
  },
  checkButtonTextDisabled: {
    color: '#999',
  },
  answerButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  answerButtonSelected: {
    backgroundColor: '#E3F2FD',
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  answerButtonCorrect: {
    backgroundColor: '#E8F5E8',
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  answerButtonWrong: {
    backgroundColor: '#FFEBEE',
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#F44336',
  },
  answerText: {
    fontSize: 18,
    fontFamily: 'Baloo2-Medium',
    color: '#333',
    textAlign: 'center',
  },
});

export default QuizScreen;
