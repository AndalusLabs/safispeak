import { createClient } from '@supabase/supabase-js';
import { Audio } from 'expo-av';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SigninModal from '../components/SigninModal';
import SignupModal from '../components/SignupModal';
import { SUPABASE_CONFIG, supabaseAnonKey, supabaseUrl } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { presentRevenueCatPaywall } from '../paywall';
import { createAnonymousUser } from '../services/anonymousUserService';
import { ProgressService } from '../services/progressService';
import AccountPromptScreen from './AccountPromptScreen';
import FlashcardScreen from './FlashcardScreen';
import MotivationScreen from './MotivationScreen';
import QuizScreen from './QuizScreen';
import WelcomeScreen from './WelcomeScreen';

const { width, height } = Dimensions.get('window');

// Initialize Supabase client
const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

interface Question {
  id: number;
  stimulus: string;
  options: string[];
  correct: number;
  explanation: string;
}

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

interface Lesson {
  id: number;
  title: string;
  questions: Question[];
}

interface LessonScreenProps {
  lesson: Lesson;
  onBack: () => void;
}

const LessonScreen: React.FC<LessonScreenProps> = ({ lesson, onBack }) => {
  const safeTop = useSafeAreaInsets().top;
  const { isAuthenticated, user } = useAuth();
  const { showSignin, skipAuth, fromWelcome } = useLocalSearchParams<{ showSignin?: string; skipAuth?: string; fromWelcome?: string }>();
  
  // State management
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showSigninModal, setShowSigninModal] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  const [welcomeUsername, setWelcomeUsername] = useState('');
  const [words, setWords] = useState<Word[]>([]);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [showMotivationScreen, setShowMotivationScreen] = useState(false);
  const [showSecondMotivationScreen, setShowSecondMotivationScreen] = useState(false);
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);
  const [showWordsSectionSignup, setShowWordsSectionSignup] = useState(false);
  const [skippedAccount, setSkippedAccount] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(true); // Start with flashcards first
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isChapterCompleted, setIsChapterCompleted] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Flashcard data
  const flashcards = [
    { darija: 'Assalamou Alaikoum', translation: 'Vrede zij met jou / Hallo' },
    { darija: 'Labas', translation: 'Hoe gaat het?' },
    { darija: 'Chokran', translation: 'Dank je wel' },
  ];

  // Load words when component mounts
  useEffect(() => {
    fetchWords();
  }, []);

  // Check chapter progress when authenticated
  useEffect(() => {
    const checkChapterProgress = async () => {
      if (isAuthenticated && user?.id) {
        const completed = await ProgressService.isChapterCompleted(user.id, lesson.id);
        setIsChapterCompleted(completed);
        // If chapter is already completed, user should start from beginning
        // (This is the expected behavior per user's request)
      }
    };

    checkChapterProgress();
  }, [isAuthenticated, user?.id, lesson.id]);

  // Present RevenueCat paywall when requested
  useEffect(() => {
    if (!showPaywall) return;

    let isActive = true;

    const showRevenueCatPaywall = async () => {
      const purchased = await presentRevenueCatPaywall();

      if (!isActive) return;

      if (purchased) {
        // If user skipped account creation, create anonymous user
        if (skippedAccount && !isAuthenticated) {
          try {
            const anonUserId = await createAnonymousUser();
            console.log('Anonymous user created and logged into RevenueCat:', anonUserId);
            // User is now premium via RevenueCat entitlements
          } catch (error) {
            console.error('Error creating anonymous user:', error);
          }
        }

        // If authenticated, mark chapter as completed
        if (isAuthenticated && user?.id) {
          await ProgressService.markChapterCompleted(user.id, lesson.id);
          setIsChapterCompleted(true);
        }
      }

      setShowPaywall(false);
      onBack();
    };

    showRevenueCatPaywall();

    return () => {
      isActive = false;
    };
  }, [showPaywall, isAuthenticated, user?.id, lesson.id, skippedAccount, onBack]);

  // Handle query parameters
  useEffect(() => {
    if (showSignin === 'true') {
      setShowSigninModal(true);
    } else if (!isAuthenticated && skipAuth !== 'true') {
      // Show signup modal if not authenticated and no skipAuth parameter
      setShowSignupModal(true);
    }
  }, [showSignin, isAuthenticated, skipAuth]);

  // Handle authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      setShowSignupModal(false);
      setShowSigninModal(false);
      // Don't show welcome screen - user should continue with lesson
      setShowWelcomeScreen(false);
    }
  }, [isAuthenticated]);

  const handleAnswer = (selectedIndex: number) => {
    const question = lesson.questions[currentQuestion];
    if (selectedIndex === question.correct) {
      setScore(score + 1);
    }
    
    // Don't automatically advance to next question
    // Let the user click "Next" button
  };

  const handleNext = async () => {
    if (currentQuestion < lesson.questions.length - 1) {
      const nextQuestion = currentQuestion + 1;
      
      // Show motivation screen after question 3 (words section)
      if (currentQuestion === 2) { // After question 3 (index 2)
        setShowMotivationScreen(true);
        // Don't update currentQuestion yet, let motivation screen handle it
      } else {
        setCurrentQuestion(nextQuestion);
      }
    } else {
      // All questions completed
      // For chapter 1, show account prompt (if not authenticated) or paywall
      if (lesson.id === 1) {
        if (!isAuthenticated) {
          setShowAccountPrompt(true);
        } else {
          setShowPaywall(true);
        }
      } else {
        // For other chapters, mark as completed and go back
        if (isAuthenticated && user?.id) {
          await ProgressService.markChapterCompleted(user.id, lesson.id);
          setIsChapterCompleted(true);
        }
        onBack();
      }
    }
  };

  const handleContinueToFlashcards = () => {
    setShowSecondMotivationScreen(false);
    setShowFlashcards(true);
  };

  const handleFlashcardNext = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // All flashcards completed, show motivation screen before questions
      setShowSecondMotivationScreen(true);
    }
  };

  const handleFlashcardPrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const playStimulus = async () => {
    const currentQ = lesson.questions[currentQuestion];
    await playDarijaAudio(currentQ.stimulus);
  };

  const playDarijaAudio = async (darijaText: string) => {
    if (isPlaying) return;
    setIsPlaying(true);
    
    console.log('Looking for Darija audio:', darijaText);
    console.log('Available words:', words.map(w => w.darija));
    console.log('Available phrases:', phrases.map(p => p.darija));
    
    try {
      // First try to find in words - exact match
      let wordData = words.find(word => word.darija === darijaText);
      
      // If no exact match in words, try case-insensitive match
      if (!wordData) {
        wordData = words.find(word => word.darija.toLowerCase() === darijaText.toLowerCase());
      }
      
      // If still not found in words, try phrases - exact match
      if (!wordData) {
        wordData = phrases.find(phrase => phrase.darija === darijaText);
      }
      
      // If no exact match in phrases, try case-insensitive match
      if (!wordData) {
        wordData = phrases.find(phrase => phrase.darija.toLowerCase() === darijaText.toLowerCase());
      }
      
      console.log('Found Darija audio data:', wordData);
      
      if (wordData && wordData.audio_file) {
        // Build audio URL from Supabase storage with dynamic chapter
        const chapterFolder = `chapter_${lesson.id}`;
        const actualFileName = wordData.audio_file;
        const filePath = `${chapterFolder}/${actualFileName}`;
        
        // Use Supabase storage client to get public URL
        const { data: urlData } = supabase.storage
          .from(SUPABASE_CONFIG.bucket)
          .getPublicUrl(filePath);
        
        const audioUrl = urlData.publicUrl;
        
        console.log('Audio file from database:', actualFileName);
        console.log('Chapter folder:', chapterFolder);
        console.log('File path:', filePath);
        console.log('Bucket:', SUPABASE_CONFIG.bucket);
        console.log('Public URL from Supabase:', audioUrl);
        
        try {
          // First verify the file exists by trying to fetch it
          const testResponse = await fetch(audioUrl);
          console.log('File accessibility check:', testResponse.status, testResponse.statusText);
          
          if (!testResponse.ok) {
            throw new Error(`File not accessible: ${testResponse.status} ${testResponse.statusText}`);
          }
          
          const sound = new Audio.Sound();
          await sound.loadAsync({ 
            uri: audioUrl,
          });
          
          // Get the duration of the audio
          const status = await sound.getStatusAsync();
          const duration = status.isLoaded ? status.durationMillis : 3000;
          
          await sound.playAsync();
          console.log('Successfully played Darija audio');
          
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
          console.log('Supabase Darija audio failed:', audioError);
          console.log('Failed URL:', audioUrl);
          setIsPlaying(false);
        }
      } else {
        console.log(`No matching word/phrase found in database for: "${darijaText}"`);
        console.log('Please add this word to the database or check the spelling.');
        setIsPlaying(false);
      }
    } catch (error) {
      console.log('Error playing Darija audio:', error);
      setIsPlaying(false);
    }
  };

  const playFlashcardAudio = async () => {
    if (isPlaying) return;
    const currentCard = flashcards[currentCardIndex];
    await playDarijaAudio(currentCard.darija);
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

  const handleSignupSuccess = (username: string) => {
    setWelcomeUsername(username);
    setShowWelcomeScreen(true);
  };

  const handleSigninSuccess = () => {
    // If user came from welcome page, they should go directly to the lesson
    // Don't show welcome screen - just close signin modal and continue with lesson
    setShowSigninModal(false);
    setShowWelcomeScreen(false);
  };

  // Show signup modal if not authenticated
  if (!isAuthenticated && showSignupModal) {
    return (
      <View style={styles.container}>
        <SignupModal
          visible={showSignupModal}
          onClose={() => setShowSignupModal(false)}
          onSuccess={handleSignupSuccess}
        />
      </View>
    );
  }

  // Show signin modal
  if (showSigninModal) {
    return (
      <View style={styles.container}>
        <SigninModal
          visible={showSigninModal}
          onClose={() => {
            setShowSigninModal(false);
            // If came from welcome page, navigate back to welcome
            if (fromWelcome === 'true') {
              router.push('/welcome');
            }
          }}
          onSuccess={handleSigninSuccess}
        />
      </View>
    );
  }

  // Show welcome screen after authentication
  if (showWelcomeScreen) {
    return (
      <WelcomeScreen
        username={welcomeUsername}
        score={score}
        onContinue={() => {
          setShowWelcomeScreen(false);
          setShowSigninModal(false);
          setShowSignupModal(false);
        }}
      />
    );
  }

  // Show account prompt at the end of chapter 1 (before paywall)
  if (showAccountPrompt) {
    return (
      <AccountPromptScreen
        onCreateAccount={() => {
          setShowAccountPrompt(false);
          setShowWordsSectionSignup(true);
          setSkippedAccount(false);
        }}
        onContinueWithoutAccount={() => {
          setShowAccountPrompt(false);
          setSkippedAccount(true);
          setWelcomeUsername(''); // Reset username when skipping account
          setShowPaywall(true);
        }}
      />
    );
  }

  // Show signup modal (after account prompt if user chose to create account)
  if (showWordsSectionSignup) {
    return (
      <View style={styles.container}>
        <SignupModal
          visible={showWordsSectionSignup}
          onClose={() => {
            setShowWordsSectionSignup(false);
            setShowAccountPrompt(true); // Go back to account prompt screen
          }}
          onSuccess={(username: string) => {
            setWelcomeUsername(username);
            setShowWordsSectionSignup(false);
            setShowPaywall(true);
          }}
        />
      </View>
    );
  }

  // Show first motivation screen
  if (showMotivationScreen) {
    return (
      <MotivationScreen
        title="Great Progress!"
        message="You've completed the words, now let's go to the sentences!"
        buttonText="Continue to Sentences"
        progress={1}
        onContinue={() => {
          setShowMotivationScreen(false);
          setCurrentQuestion(3); // Continue to question 4 (index 3)
        }}
      />
    );
  }

  // Show second motivation screen (after flashcards, before questions)
  if (showSecondMotivationScreen) {
    return (
      <MotivationScreen
        title="Great Progress!"
        message="You've completed the flashcards! Now let's test your knowledge with some questions."
        buttonText="Continue to Questions"
        progress={2}
        onContinue={() => {
          setShowSecondMotivationScreen(false);
          setShowFlashcards(false);
          setCurrentQuestion(0); // Start with first question
        }}
      />
    );
  }

  // Show flashcards
  if (showFlashcards) {
    return (
      <FlashcardScreen
        flashcards={flashcards}
        currentCardIndex={currentCardIndex}
        onNext={handleFlashcardNext}
        onPrevious={handleFlashcardPrevious}
        onBack={() => setShowFlashcards(false)}
        onPlayAudio={playFlashcardAudio}
        isPlaying={isPlaying}
      />
    );
  }

  // Show quiz screen
  return (
    <QuizScreen
      question={lesson.questions[currentQuestion]}
      questionNumber={currentQuestion + 1}
      totalQuestions={lesson.questions.length}
      onAnswer={handleAnswer}
      onNext={handleNext}
      onBack={onBack}
      onPlayStimulus={playStimulus}
      onPlayDarijaAudio={playDarijaAudio}
      words={words}
      phrases={phrases}
      isPlaying={isPlaying}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
});

export default LessonScreen;
