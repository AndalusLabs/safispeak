// /app/lesson/[id].tsx
import { createClient } from '@supabase/supabase-js';
import { Audio } from 'expo-av';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import LottieView from 'lottie-react-native';
import { MotiImage } from 'moti';
import React, { useEffect, useState } from 'react';
import { AppState, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SUPABASE_CONFIG } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
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

// Types for phrases data 
interface Phrase {
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
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [words, setWords] = useState<Word[]>([]);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [showMotivationScreen, setShowMotivationScreen] = useState(false);
  const [hasPlayedWinningSound, setHasPlayedWinningSound] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  
  // Auth context
  const { isAuthenticated, user } = useAuth();

  // Complete any pending auth sessions
  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  // Listen for auth state changes to handle successful login
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === 'active' && showSignupModal) {
        console.log('App became active, checking auth session...');
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('Found session after returning to app!');
          setShowSignupModal(false);
          setShowMotivationScreen(false);
          setCurrentQuestion(3);
          setSelectedAnswer(null);
          setFeedback(null);
          setAnswerChecked(false);
        }
      }
    };
  
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [showSignupModal]);

  //google login function
  const handleGoogleLogin = async () => {
    try {
      console.log('Starting Google OAuth...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://zgrdjsqvgckpfntwdhri.supabase.co/auth/v1/callback',
          skipBrowserRedirect: true,
        }
      });
  
      if (error) {
        console.log('OAuth error:', error);
        return;
      }
  
      if (data?.url) {
        console.log('Opening OAuth URL...');
        
         // Use openAuthSessionAsync with Supabase callback
         const result = await WebBrowser.openAuthSessionAsync(
           data.url,
           'https://zgrdjsqvgckpfntwdhri.supabase.co/auth/v1/callback'
         );
        
        console.log('Auth session result:', result);
        
        // Check if user completed auth (even if we can't get tokens directly)
        if (result.type === 'success') {
          console.log('User completed OAuth, checking session...');
          
          // Wait a bit for Supabase to process the callback
          setTimeout(async () => {
            const { data: session } = await supabase.auth.getSession();
            if (session?.session) {
              console.log('Session found after OAuth!');
              setShowSignupModal(false);
              setShowMotivationScreen(false);
              setCurrentQuestion(3);
              setSelectedAnswer(null);
              setFeedback(null);
              setAnswerChecked(false);
            } else {
              console.log('No session found, user may have cancelled');
            }
          }, 2000);
        } else if (result.type === 'cancel') {
          console.log('User cancelled OAuth');
        }
      }
      
    } catch (err) {
      console.log("Google login error:", err);
    }
  };



  // Fetch words and phrases from Supabase
  const fetchWords = async () => {
    try {
      const { data: wordsData, error: wordsError } = await supabase
        .from('words')
        .select('*');
      
      if (wordsError) {
        console.log('Error fetching words:', wordsError);
        return;
      }
      
      const { data: phrasesData, error: phrasesError } = await supabase
        .from('phrases')
        .select('*');
      
      if (phrasesError) {
        console.log('Error fetching phrases:', phrasesError);
        return;
      }
      
      console.log('Fetched words:', wordsData);
      console.log('Fetched phrases:', phrasesData);
      setWords(wordsData || []);
      setPhrases(phrasesData || []);
    } catch (error) {
      console.log('Error fetching data:', error);
    }
  };

  // Load words when component mounts
  useEffect(() => {
    fetchWords();
  }, []);

  // Play winning sound when motivation screen appears
  useEffect(() => {
    console.log('showMotivationScreen changed:', showMotivationScreen);
    if (showMotivationScreen) {
      console.log('Motivation screen is showing, playing winning sound...');
      playWinningSound();
    }
  }, [showMotivationScreen]);

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

  const playWinningSound = async () => {
    if (hasPlayedWinningSound) {
      console.log('Winning sound already played, skipping...');
      return;
    }
    
    console.log('Attempting to play winning sound...');
    const sound = new Audio.Sound();
    try {
      console.log('Loading winning.mp3...');
      await sound.loadAsync(require('../assets/sounds/winning.mp3'));
      console.log('Playing winning sound...');
      await sound.playAsync();
      setHasPlayedWinningSound(true);
      console.log('Winning sound played successfully!');
    } catch (error) {
      console.log('Error playing winning sound:', error);
    }
  };


  const playStimulus = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    const currentQ = lesson.questions[currentQuestion];
    
    console.log('Looking for stimulus:', currentQ.stimulus);
    console.log('Available words:', words.map(w => w.darija));
    console.log('Available phrases:', phrases.map(p => p.darija));
    
    try {
      let wordData = null;
      
      // For first 3 questions (index 0-2), search in words
      if (currentQuestion < 3) {
        wordData = words.find(word => word.darija === currentQ.stimulus);
        
        // If no exact match in words, try case-insensitive match
        if (!wordData) {
          wordData = words.find(word => 
            word.darija.toLowerCase() === currentQ.stimulus.toLowerCase()
          );
        }
      } else {
        // For questions 4-6 (index 3-5), search in phrases
        wordData = phrases.find(phrase => phrase.darija === currentQ.stimulus);
        
        // If no exact match in phrases, try case-insensitive match
        if (!wordData) {
          wordData = phrases.find(phrase => 
            phrase.darija.toLowerCase() === currentQ.stimulus.toLowerCase()
          );
        }
        
        // If still not found, try partial match in phrases as last resort
        if (!wordData) {
          wordData = phrases.find(phrase => 
            phrase.darija.toLowerCase().includes(currentQ.stimulus.toLowerCase()) ||
            currentQ.stimulus.toLowerCase().includes(phrase.darija.toLowerCase())
          );
        }
      }
      
      console.log('Found word/phrase data:', wordData);
      
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

  const handleAnswer = async (index: number) => {
    if (answerChecked) return; // Don't allow changing answer after checking
    
    const currentQ = lesson.questions[currentQuestion];
    const selectedOption = currentQ.options[index];
    setSelectedAnswer(index);
    setAnswerChecked(false);
    setFeedback(null);
    
    // Check if the selected option exists in our words or phrases database and play audio
    let wordData = words.find(word => 
      word.darija.toLowerCase() === selectedOption.toLowerCase()
    );
    
    // If not found in words, try phrases
    if (!wordData) {
      wordData = phrases.find(phrase => 
        phrase.darija.toLowerCase() === selectedOption.toLowerCase()
      );
    }
    
    if (wordData && wordData.audio_file) {
      try {
        const chapterFolder = `chapter_${lessonId}`;
        const audioUrl = `${SUPABASE_CONFIG.url}/storage/v1/object/public/${SUPABASE_CONFIG.bucket}/${chapterFolder}/${wordData.audio_file}`;
        console.log('Playing audio for selected option:', selectedOption, 'URL:', audioUrl);
        
        const sound = new Audio.Sound();
        await sound.loadAsync({ 
          uri: audioUrl,
          headers: {
            'Accept': 'audio/mpeg, audio/mp3, audio/*',
          }
        });
        
        await sound.playAsync();
        console.log('Successfully played audio for selected option');
        
        // Clean up after playing
        setTimeout(async () => {
          try {
            await sound.unloadAsync();
          } catch (unloadError) {
            console.log('Error unloading sound:', unloadError);
          }
        }, 3000);
        
      } catch (audioError) {
        console.log('Error playing audio for selected option:', audioError);
      }
    }
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
    if (currentQuestion === 2) {
      // After question 3 (index 2), show motivation screen
      setShowMotivationScreen(true);
    } else if (currentQuestion < lesson.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setFeedback(null);
      setAnswerChecked(false);
    } else {
      // After last question (question 6), navigate to phrases
      router.push('/phrases');
    }
  };
  
  
  if (showMotivationScreen) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: safeTop + 10 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.motivationProgressContainer}>
            <Text style={styles.progressText}>Great Progress!</Text>
          </View>
          <View style={styles.placeholderSpace} />
        </View>
        
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainerStyle}
          showsVerticalScrollIndicator={false}
        >
          {/* Mascot centered */}
          <View style={styles.motivationMascotContainer}>
            <MotiImage
              source={safiLogo}
              style={styles.mascotImageMotivation}
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

          {/* Speech Bubble centered below mascot */}
          <View style={styles.motivationSpeechBubbleContainer}>
            <View style={styles.motivationSpeechBubble}>
              <Text style={styles.motivationSpeechBubbleText}>
                Safi! You've mastered your first 3 Darija words.{'\n\n'}Create a free account to save your progress — and let's build on that foundation with useful phrases.
              </Text>
            </View>
            <View style={styles.motivationSpeechTail} />
            <View style={styles.motivationSpeechTailBorder} />
          </View>

          <View style={styles.motivationContainer}>
            <TouchableOpacity
              style={styles.createAccountButton}
              onPress={() => {
                console.log('CREATE FREE ACCOUNT pressed - showing signup screen');
                setShowMotivationScreen(false); // ✅ Eerst motivation screen sluiten
                setShowSignupModal(true);       // ✅ Dan signup modal openen
              }}
            >
              <Text style={styles.createAccountButtonText}>CREATE FREE ACCOUNT</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => {
                console.log('Continue without account pressed - going to question 4');
                setShowMotivationScreen(false);
                setCurrentQuestion(3); // Go to question 4 (index 3)
                setSelectedAnswer(null);
                setFeedback(null);
                setAnswerChecked(false);
              }}
            >
              <Text style={styles.continueButtonText}>Continue without account</Text>
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
        <View style={styles.xpContainer}>
          <LottieView
            source={require('@/assets/animations/star.json')}
            autoPlay
            loop={true}
            style={styles.starIcon}
          />
          <Text style={styles.xpText}>{score * 10}</Text>
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

      {/* SIGNUP SCREEN */}
      {showSignupModal && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#fff9e9',
          zIndex: 9999,
          paddingTop: 60,
        }}>
          {/* Header */}
          <View style={{
            alignItems: 'center',
            paddingHorizontal: 20,
            marginBottom: 40,
            position: 'relative',
          }}>
            <TouchableOpacity 
              style={{
                position: 'absolute',
                right: 20,
                top: 0,
                width: 30,
                height: 30,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => setShowSignupModal(false)}
            >
              <Text style={{ fontSize: 18, color: '#666' }}>✕</Text>
            </TouchableOpacity>
            <Text style={{
              fontSize: 28,
              fontWeight: '700',
              color: '#333',
              marginBottom: 8,
              fontFamily: 'Nunito_700Bold',
            }}>
              Create Free Account
            </Text>
            <Text style={{
              fontSize: 16,
              color: '#666',
              textAlign: 'center',
              fontFamily: 'Nunito_400Regular',
            }}>
              Save your progress and continue learning
            </Text>
          </View>

          {/* Signup Options */}
          <View style={{ paddingHorizontal: 20, marginBottom: 40 }}>
            <TouchableOpacity
              style={{
                backgroundColor: '#00A86B',
                paddingVertical: 18,
                paddingHorizontal: 20,
                borderRadius: 16,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
              onPress={() => {
                console.log('Email signup pressed');
                setShowSignupModal(false);
                setShowMotivationScreen(false);
                setCurrentQuestion(3);
                setSelectedAnswer(null);
                setFeedback(null);
                setAnswerChecked(false);
              }}
            >
              <Text style={{
                color: '#fff',
                fontSize: 18,
                fontWeight: '600',
                textAlign: 'center',
                fontFamily: 'Nunito_600SemiBold',
              }}>
                📧 Sign up with Email
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                backgroundColor: '#4285F4',
                paddingVertical: 18,
                paddingHorizontal: 20,
                borderRadius: 16,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
              onPress={handleGoogleLogin}
            >
              <Text style={{
                color: '#fff',
                fontSize: 18,
                fontWeight: '600',
                textAlign: 'center',
                fontFamily: 'Nunito_600SemiBold',
              }}>
                🔍 Continue with Google
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                backgroundColor: '#000',
                paddingVertical: 18,
                paddingHorizontal: 20,
                borderRadius: 16,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
              onPress={() => {
                console.log('Apple signup pressed');
                setShowSignupModal(false);
                setShowMotivationScreen(false);
                setCurrentQuestion(3);
                setSelectedAnswer(null);
                setFeedback(null);
                setAnswerChecked(false);
              }}
            >
              <Text style={{
                color: '#fff',
                fontSize: 18,
                fontWeight: '600',
                textAlign: 'center',
                fontFamily: 'Nunito_600SemiBold',
              }}>
                🍎 Continue with Apple
              </Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <View style={{ paddingHorizontal: 20, alignItems: 'center' }}>
            <Text style={{
              fontSize: 12,
              color: '#666',
              textAlign: 'center',
              lineHeight: 18,
              fontFamily: 'Nunito_400Regular',
            }}>
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </View>
      )}

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
  progressContainer: { 
    flex: 1, 
    alignItems: 'center',
  },
  motivationProgressContainer: { 
    flex: 1, 
    alignItems: 'center',
  },
  placeholderSpace: {
    width: 55, // Same width as back button to balance the layout
  },
  
  // Signup Screen Styles
  signupScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff9e9',
    zIndex: 9999,
    paddingTop: 60,
  },
  signupHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
    position: 'relative',
  },
  signupCloseButton: {
    position: 'absolute',
    right: 20,
    top: 0,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupCloseButtonText: {
    fontSize: 18,
    color: '#666',
  },
  signupTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Nunito_700Bold',
  },
  signupSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Nunito_400Regular',
  },
  signupOptions: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  signupOptionButton: {
    backgroundColor: '#00A86B',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  appleButton: {
    backgroundColor: '#000',
  },
  signupOptionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Nunito_600SemiBold',
  },
  signupTerms: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  signupTermsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: 'Nunito_400Regular',
  },
  progressText: { 
    fontSize: 16, 
    color: '#666', 
    marginBottom: 10,
    fontFamily: 'Nunito_400Regular'
  },
  xpContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: 15,
    justifyContent: 'flex-start',
    paddingTop: 10,
  },
  starIcon: {
    width: 60,
    height: 60,
    marginBottom: 2,
  },
  xpText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Nunito_600SemiBold',
    fontWeight: '600',
  },
  progressBar: {
    width: '80%',
    height: 6,
    backgroundColor: '#E5E5E5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#00A86B', borderRadius: 4 },
  content: { flex: 1, paddingHorizontal: 20 },
  contentContainerStyle: { paddingTop: 20, paddingBottom: 100, flexGrow: 1 },
  
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
    fontFamily: 'Nunito_400Regular',
    color: '#666',
    lineHeight: 20,
    flex: 1,
  },
  errorText: { 
    fontSize: 20, 
    color: 'red', 
    textAlign: 'center', 
    marginTop: 100,
    fontFamily: 'Nunito_600SemiBold'
  },
  createAccountButton: {
    marginTop: 10,
    backgroundColor: '#00A86B',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createAccountButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'Nunito_700Bold'
  },
  continueButton: {
    marginTop: 15,
    backgroundColor: '#E0E0E0',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  continueButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Nunito_600SemiBold'
  },
  
  // Check/Next Button Styles
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
  
  // Motivation Screen Styles
  motivationMascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  mascotImageMotivation: {
    width: 180,
    height: 180,
  },
  motivationSpeechBubbleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 5,
    marginBottom: 20,
    position: 'relative',
  },
  motivationSpeechBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: '90%',
  },
  motivationSpeechBubbleText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Nunito_600SemiBold',
    textAlign: 'center',
    lineHeight: 22,
  },
  motivationSpeechTail: {
    position: 'absolute',
    top: -8,
    left: '55%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
    zIndex: 2,
  },
  motivationSpeechTailBorder: {
    position: 'absolute',
    top: -11,
    left: '55%',
    marginLeft: -11,
    width: 0,
    height: 0,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderBottomWidth: 11,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(0,0,0,0.06)',
    zIndex: 1,
  },
  motivationContainer: { 
    flex: 1, 
    justifyContent: 'flex-start', 
    alignItems: 'center', 
    padding: 20,
    marginTop: 20,
    paddingTop: 40,
  },
});
