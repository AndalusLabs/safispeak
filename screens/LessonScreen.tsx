import { createClient } from '@supabase/supabase-js';
import { Audio } from 'expo-av';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SigninModal from '../components/SigninModal';
import SignupModal from '../components/SignupModal';
import { SUPABASE_CONFIG, supabaseAnonKey, supabaseUrl } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
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
  const { isAuthenticated } = useAuth();
  const { showSignin } = useLocalSearchParams<{ showSignin?: string }>();
  
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
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Flashcard data
  const flashcards = [
    { darija: 'Assalamou Alaikoum', translation: 'Vrede zij met jou / Hallo' },
    { darija: 'Labas', translation: 'Hoe gaat het?' },
    { darija: 'Shukran', translation: 'Dank je wel' },
  ];

  // Load words when component mounts
  useEffect(() => {
    fetchWords();
  }, []);

  // Handle query parameters
  useEffect(() => {
    if (showSignin === 'true') {
      setShowSigninModal(true);
    } else if (!isAuthenticated) {
      // Show signup modal if not authenticated and no specific signin request
      setShowSignupModal(true);
    }
  }, [showSignin, isAuthenticated]);

  // Handle authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      setShowWelcomeScreen(true);
      setShowSignupModal(false);
      setShowSigninModal(false);
      setShowMotivationScreen(false);
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

  const handleNext = () => {
    if (currentQuestion < lesson.questions.length - 1) {
      const nextQuestion = currentQuestion + 1;
      
      // Show first motivation screen after question 3 (words section)
      if (currentQuestion === 2) { // After question 3 (index 2)
        setShowMotivationScreen(true);
        // Don't update currentQuestion yet, let motivation screen handle it
      } else {
        setCurrentQuestion(nextQuestion);
      }
    } else {
      // Show second motivation screen after all questions (sentences section)
      setShowSecondMotivationScreen(true);
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
      // All flashcards completed, navigate to phrases
      // This would typically navigate to the next section
      onBack();
    }
  };

  const handleFlashcardPrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
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
          wordData = words.find(word => word.darija.toLowerCase() === currentQ.stimulus.toLowerCase());
        }
      } else {
        // For questions 4-6 (index 3-5), search in phrases
        wordData = phrases.find(phrase => phrase.darija === currentQ.stimulus);
        // If no exact match in phrases, try case-insensitive match
        if (!wordData) {
          wordData = phrases.find(phrase => phrase.darija.toLowerCase() === currentQ.stimulus.toLowerCase());
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
        const chapterFolder = `chapter_${lesson.id}`;
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
    setShowWelcomeScreen(true);
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
          onClose={() => setShowSigninModal(false)}
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

  // Show first motivation screen
  if (showMotivationScreen) {
    return (
      <MotivationScreen
        title="Great Progress!"
        message="You've completed the words section! Now let's move on to sentences."
        buttonText="Continue to Sentences"
        progress={1}
        onContinue={() => {
          setShowMotivationScreen(false);
          setCurrentQuestion(3); // Continue to question 4 (index 3)
        }}
      />
    );
  }

  // Show second motivation screen
  if (showSecondMotivationScreen) {
    return (
      <MotivationScreen
        title="Great Progress!"
        message="Excellent work on the sentences! Now let's continue to some flashcards to reinforce what you've learned."
        buttonText="Continue to Flashcards"
        progress={2}
        onContinue={handleContinueToFlashcards}
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
        onPlayAudio={playStimulus}
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
      onBack={onBack}
      onPlayStimulus={playStimulus}
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
