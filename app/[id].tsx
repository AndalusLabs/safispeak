// /app/lesson/[id].tsx
import { createClient } from '@supabase/supabase-js';
import { Audio } from 'expo-av';
import { router, useLocalSearchParams } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SUPABASE_CONFIG } from '../config/supabase';
import lessons from './lessons';

const { width, height } = Dimensions.get('window');
const safiLogo = require('@/assets/images/logo_new_black.png');

// Supabase configuration
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Types for words data
interface Word {
  id: number;
  darija: string;
  audio_file: string;
}



export default function LessonScreen() {
  const insets = useSafeAreaInsets();
  const safeTop = insets?.top || 50;
  const { id } = useLocalSearchParams<{ id: string }>();
  const lessonId = id || '1';
  const lesson = lessons[Number(lessonId) as keyof typeof lessons];
  const [feedback, setFeedback] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [words, setWords] = useState<Word[]>([]);

  // Fetch words from Supabase
  const fetchWords = async () => {
    try {
      const { data, error } = await supabase
        .from('words')
        .select('*');
      
      if (error) {
        console.log('Error fetching words:', error);
        return;
      }
      
      console.log('Fetched words:', data);
      setWords(data || []);
    } catch (error) {
      console.log('Error fetching words:', error);
    }
  };

  // Load words when component mounts
  useEffect(() => {
    fetchWords();
  }, []);

  const playSound = async (type: 'correct' | 'wrong') => {
    const sound = new Audio.Sound();
    try {
      const source =
        type === 'correct'
          ? require('../assets/sounds/correct.mp3')
          : require('../assets/sounds/wrong.mp3');
      await sound.loadAsync(source);
      await sound.playAsync();
    } catch (error) {
      console.log('Error playing sound', error);
    }
  };


  const playStimulus = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    const currentQ = lesson.questions[currentQuestion];
    
    console.log('Looking for stimulus:', currentQ.stimulus);
    console.log('Available words:', words.map(w => w.darija));
    
    try {
      // Find the word in our words data - try exact match first, then partial match
      let wordData = words.find(word => word.darija === currentQ.stimulus);
      
      // If no exact match, try case-insensitive match
      if (!wordData) {
        wordData = words.find(word => 
          word.darija.toLowerCase() === currentQ.stimulus.toLowerCase()
        );
      }
      
      // If still no match, try partial match (for "Salam" -> "Assalamu Alaikoum")
      if (!wordData) {
        wordData = words.find(word => 
          word.darija.toLowerCase().includes(currentQ.stimulus.toLowerCase()) ||
          currentQ.stimulus.toLowerCase().includes(word.darija.toLowerCase())
        );
      }
      
      console.log('Found word data:', wordData);
      
      if (wordData && wordData.audio_file) {
        // Build audio URL from Supabase storage with dynamic chapter
        const chapterFolder = `chapter_${lessonId}`;
        // Use audio_file directly
        const actualFileName = wordData.audio_file;
        const audioUrl = `${SUPABASE_CONFIG.url}/storage/v1/object/public/${SUPABASE_CONFIG.bucket}/${chapterFolder}/${actualFileName}`;
        console.log('Trying to play audio from URL:', audioUrl);
        
        try {
          // First, let's test if the URL is accessible
          console.log('Testing URL accessibility...');
          const response = await fetch(audioUrl, { method: 'HEAD' });
          console.log('URL response status:', response.status);
          
          if (!response.ok) {
            throw new Error(`File not found: ${response.status} ${response.statusText}`);
          }
          
          const sound = new Audio.Sound();
          await sound.loadAsync({ 
            uri: audioUrl,
            headers: {
              'Accept': 'audio/mpeg, audio/mp3, audio/*',
            }
          });
          
          // Get the duration of the audio
          const status = await sound.getStatusAsync();
          const duration = status.isLoaded ? status.durationMillis : 3000;
          
          await sound.playAsync();
          console.log('Successfully played Supabase audio');
          
          // Reset playing state after audio duration
          setTimeout(async () => {
            try {
              await sound.unloadAsync();
            } catch (unloadError) {
              console.log('Error unloading sound:', unloadError);
            }
            setIsPlaying(false);
          }, duration || 3000);
          
        } catch (audioError) {
          console.log('Supabase audio failed:', audioError);
          console.log('Failed URL:', audioUrl);
          setIsPlaying(false);
        }
      } else {
        console.log('No matching word found in database');
        setIsPlaying(false);
      }
    } catch (error) {
      console.log('Error playing stimulus:', error);
      setIsPlaying(false);
    }
  };

  if (!lesson) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Lesson not found ❌</Text>
      </View>
    );
  }

  const handleAnswer = (index: number) => {
    if (answerChecked) return; // Don't allow changing answer after checking
    
    const currentQ = lesson.questions[currentQuestion];
    const selectedOption = currentQ.options[index];
    setSelectedAnswer(index);
    setAnswerChecked(false);
    setFeedback(null);
  };

  const handleCheck = () => {
    if (selectedAnswer === null) return;
    
    const correctIndex = lesson.questions[currentQuestion].correct;
    
    if (selectedAnswer === correctIndex) {
      setScore(score + 1);
      playSound('correct');
    } else {
      playSound('wrong');
    }
    
    // Show explanation regardless of correct/incorrect
    setFeedback(lesson.questions[currentQuestion].explanation);
    setAnswerChecked(true);
  };

  const handleNext = () => {
    if (currentQuestion < lesson.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setFeedback(null);
      setAnswerChecked(false);
    } else {
      completeLesson();
    }
  };
  const completeLesson = () => {
    setLessonCompleted(true);
  };
  
  
  if (lessonCompleted) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: safeTop + 10 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Lesson Complete!</Text>
          </View>
        </View>
        
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainerStyle}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo and Speech Bubble */}
          <View style={styles.logoAndSpeechContainer}>
            <Image source={safiLogo} style={styles.mascotImageTiny} resizeMode="contain" fadeDuration={0} />
            
            {/* Speech Bubble */}
            <View style={styles.speechBubbleContainer}>
              <View style={styles.speechBubble}>
                <Text style={styles.speechBubbleText}>Great job! You're doing amazing!</Text>
              </View>
              <View style={styles.speechTail} />
              <View style={styles.speechTailBorder} />
            </View>
          </View>

          <View style={styles.completionContainer}>
            <Text style={styles.completionEmoji}>🎉</Text>
            <Text style={styles.completionTitle}>Lesson Completed!</Text>
            <Text style={styles.completionScore}>
              Score: {score}/{lesson.questions.length}
            </Text>
            <Text style={styles.completionText}>You finished {lesson.title}! 🚀</Text>
            <Text style={styles.completionSubtext}>Keep going to improve your Darija!</Text>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => router.push('/paywall')}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }
  

  const currentQ = lesson.questions[currentQuestion];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: safeTop + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Question {currentQuestion + 1} of {lesson.questions.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentQuestion + 1) / lesson.questions.length) * 100}%` },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainerStyle}
        showsVerticalScrollIndicator={false}
      >
        {/* Instruction Text */}
        <Text style={styles.instructionText}>Choose the correct meaning...</Text>

        <View style={styles.questionContainer}>
          {/* Mascot and Speech Bubble */}
          <View style={styles.stimulusContainer}>
            <Image source={safiLogo} style={styles.mascotImageStimulus} resizeMode="contain" fadeDuration={0} />
            
            {/* Speech Bubble */}
            <View style={styles.speechBubbleContainer}>
              <View style={styles.speechBubble}>
                <Text style={styles.speechBubbleText}>
                  {currentQ.stimulus}
                </Text>
              </View>
              <View style={styles.speechTail} />
              <View style={styles.speechTailBorder} />
            </View>
            
            {/* Speaker Button */}
            <TouchableOpacity onPress={playStimulus} style={styles.speakerButton}>
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
              {currentQ.options.slice(0, 2).map((option, index) => {
                const correctIndex = currentQ.correct;
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
                    onPress={() => handleAnswer(index)}
                    disabled={answerChecked}
                  >
                    <Text style={[
                      styles.optionText,
                      isSelected && !answerChecked && styles.optionTextSelected
                    ]}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.optionsRow}>
              {currentQ.options.slice(2, 4).map((option, index) => {
                const actualIndex = index + 2; // Adjust index for second row
                const correctIndex = currentQ.correct;
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
                    onPress={() => handleAnswer(actualIndex)}
                    disabled={answerChecked}
                  >
                    <Text style={[
                      styles.optionText,
                      isSelected && !answerChecked && styles.optionTextSelected
                    ]}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Feedback text onder de knoppen */}
          {feedback && (
            <View style={[
              styles.feedbackContainer,
              answerChecked && selectedAnswer === lesson.questions[currentQuestion].correct && styles.feedbackContainerCorrect,
              answerChecked && selectedAnswer !== lesson.questions[currentQuestion].correct && styles.feedbackContainerWrong
            ]}>
              {answerChecked && (
                <LottieView
                  source={
                    selectedAnswer === lesson.questions[currentQuestion].correct
                      ? require('@/assets/animations/correct_answer.json')
                      : require('@/assets/animations/wrong_answer.json')
                  }
                  autoPlay
                  loop={false}
                  style={styles.feedbackAnimation}
                />
              )}
              <Text style={styles.feedbackText}>
                {feedback}
              </Text>
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
            answerChecked && selectedAnswer === lesson.questions[currentQuestion].correct && styles.checkButtonCorrect,
            answerChecked && selectedAnswer !== lesson.questions[currentQuestion].correct && styles.checkButtonWrong
          ]}
          onPress={answerChecked ? handleNext : handleCheck}
          disabled={selectedAnswer === null && !answerChecked}
        >
          <Text style={[
            styles.checkButtonText,
            selectedAnswer === null && !answerChecked && styles.checkButtonTextDisabled
          ]}>
            {answerChecked 
              ? (selectedAnswer === lesson.questions[currentQuestion].correct ? 'Next' : 'Got it!!')
              : 'Check'
            }
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff9e9' 
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
    marginRight: 15,
  },
  backIcon: { 
    fontSize: 20, 
    color: '#333',
    fontFamily: 'Nunito_600SemiBold'
  },
  progressContainer: { flex: 1, alignItems: 'center' },
  progressText: { 
    fontSize: 16, 
    color: '#666', 
    marginBottom: 10,
    fontFamily: 'Nunito_400Regular'
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#00A86B', borderRadius: 4 },
  content: { flex: 1, paddingHorizontal: 20 },
  contentContainerStyle: { paddingTop: 20, paddingBottom: 24, flexGrow: 1 },
  
  // Logo and Speech Bubble Styles (matching onboarding)
  logoAndSpeechContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  mascotImageTiny: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  
  instructionText: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Nunito_600SemiBold',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  questionContainer: { 
    flex: 1, 
    justifyContent: 'space-between', 
    alignItems: 'center' 
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  speechBubbleText: {
    fontSize: 22,
    color: '#333',
    fontFamily: 'Nunito_700Bold',
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
    left: -10,
    top: 20,
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderRightWidth: 14,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#FFFFFF',
  },
  speechTailBorder: {
    position: 'absolute',
    left: -12,
    top: 19,
    width: 0,
    height: 0,
    borderTopWidth: 11,
    borderBottomWidth: 11,
    borderRightWidth: 15,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'rgba(0,0,0,0.06)',
  },
  optionsContainer: { width: '100%' },
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flex: 1,
    marginHorizontal: 6,
  },
  optionButtonSelected: {
    borderWidth: 3,
    borderColor: '#333',
  },
  optionText: { 
    fontSize: 14, 
    color: '#333', 
    textAlign: 'center', 
    fontWeight: '500',
    fontFamily: 'Nunito_600SemiBold'
  },
  optionTextSelected: {
    fontWeight: '700',
    fontFamily: 'Nunito_700Bold'
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
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
    fontFamily: 'Nunito_400Regular',
    color: '#666',
    lineHeight: 20,
    flex: 1,
  },
  completionContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
    marginTop: 20
  },
  completionEmoji: { fontSize: 80, marginBottom: 20 },
  completionTitle: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 15,
    fontFamily: 'Nunito_800ExtraBold'
  },
  completionScore: { 
    fontSize: 24, 
    color: '#00A86B', 
    fontWeight: '600', 
    marginBottom: 20,
    fontFamily: 'Nunito_700Bold'
  },
  completionText: { 
    fontSize: 18, 
    color: '#666', 
    textAlign: 'center', 
    marginBottom: 10,
    fontFamily: 'Nunito_400Regular'
  },
  completionSubtext: { 
    fontSize: 16, 
    color: '#999', 
    textAlign: 'center', 
    fontStyle: 'italic',
    fontFamily: 'Nunito_400Regular'
  },
  errorText: { 
    fontSize: 20, 
    color: 'red', 
    textAlign: 'center', 
    marginTop: 100,
    fontFamily: 'Nunito_600SemiBold'
  },
  continueButton: {
    marginTop: 30,
    backgroundColor: '#00A86B',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'Nunito_700Bold'
  },
  
  // Check/Next Button Styles
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 30,
  },
  checkButton: {
    backgroundColor: '#00A86B',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
    fontFamily: 'Nunito_700Bold'
  },
  checkButtonTextDisabled: {
    color: '#999',
  },
});
