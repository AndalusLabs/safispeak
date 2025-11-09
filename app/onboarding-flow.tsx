// must be first
import { Ionicons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { MotiImage } from 'moti';
import React, { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const safiLogo = require('@/assets/images/logo_new_black.png');
// 👇 preload logo meteen
Asset.loadAsync([safiLogo]);
const { width, height } = Dimensions.get('window');


type OnboardingStep = 'intro' | 'questions-intro' | 'discover-source' | 'motivation' | 'darija-level' | 'learning-goal' | 'motivation-goal' | 'notifications-permission' | 'encouragement' | 'intro-first-lesson';



export default function OnboardingFlowScreen() {
  const insets = useSafeAreaInsets();
  const safeTop = insets?.top || 50;
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('intro');
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedMotivations, setSelectedMotivations] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedLearningGoal, setSelectedLearningGoal] = useState<string>('');
  const [notificationPermission, setNotificationPermission] = useState<'granted' | 'denied' | null>(null);

  const requestNotificationPermission = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        setNotificationPermission('granted');
      } else {
        setNotificationPermission('denied');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setNotificationPermission('denied');
    }
  };

    // 👇 hier toevoegen
    React.useEffect(() => {
      Asset.fromModule(safiLogo).downloadAsync();
    }, []);

  const getProgressWidth = () => {
    switch (currentStep) {
      case 'intro': return '0%';
      case 'questions-intro': return '0%';
      case 'discover-source': return '14%';
      case 'motivation': return '28%';
      case 'darija-level': return '42%';
      case 'learning-goal': return '56%';
      case 'motivation-goal': return '70%';
      case 'notifications-permission': return '84%';
      case 'encouragement': return '98%';
      case 'intro-first-lesson': return '100%';
      default: return '0%';
    }
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'intro':
        setCurrentStep('questions-intro');
        break;
      case 'questions-intro':
        setCurrentStep('discover-source');
        break;
      case 'discover-source':
        setCurrentStep('motivation');
        break;
      case 'motivation':
        setCurrentStep('darija-level');
        break;
      case 'darija-level':
        setCurrentStep('learning-goal');
        break;
      case 'learning-goal':
        setCurrentStep('motivation-goal');
        break;
      case 'motivation-goal':
        setCurrentStep('notifications-permission');
        break;
      case 'notifications-permission':
        setCurrentStep('encouragement');
        break;
      case 'encouragement':
        setCurrentStep('intro-first-lesson');
        break;
               case 'intro-first-lesson':
           router.push('/lessons/1');
           break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'questions-intro':
        setCurrentStep('intro');
        break;
      case 'discover-source':
        setCurrentStep('questions-intro');
        break;
      case 'motivation':
        setCurrentStep('discover-source');
        break;
      case 'darija-level':
        setCurrentStep('motivation');
        break;
      case 'learning-goal':
        setCurrentStep('darija-level');
        break;
      case 'motivation-goal':
        setCurrentStep('learning-goal');
        break;
      case 'notifications-permission':
        setCurrentStep('motivation-goal');
        break;
      case 'encouragement':
        setCurrentStep('notifications-permission');
        break;
      case 'intro-first-lesson':
        setCurrentStep('encouragement');
        break;
      default:
        // Don't use router.back() as it can cause "lesson not found" errors
        // Instead, just stay on the current step or go to intro
        setCurrentStep('intro');
        break;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'discover-source':
        return selectedSource !== '';
      case 'motivation':
        return selectedMotivations.length > 0;
      case 'darija-level':
        return selectedLevel !== null;
      case 'learning-goal':
        return selectedLearningGoal !== '';
      case 'notifications-permission':
        return notificationPermission !== null;
      default:
        return true;
    }
  };

  const discoverOptions = [
    'TikTok',
    'Google', 
    'YouTube',
    'App Store',
    'Family & Friends'
  ];

  const motivationOptions = [
    { id: 'productive', text: 'Spend my time productively', icon: <Ionicons name="bulb-outline" size={26} color="#FFD700" /> }, // goud/geel
    { id: 'family', text: 'Connect with family & friends', icon: <Ionicons name="people-outline" size={26} color="#FF6B6B" /> }, // warm rood
    { id: 'studies', text: 'Support my studies', icon: <Ionicons name="book-outline" size={26} color="#4ECDC4" /> }, // turquoise
    { id: 'career', text: 'Boost my career', icon: <Ionicons name="briefcase-outline" size={26} color="#1E90FF" /> }, // blauw
    { id: 'fun', text: 'Just for fun', icon: <Ionicons name="sparkles-outline" size={26} color="#9B59B6" /> }, // paars
    { id: 'travel', text: 'Prepare for travel', icon: <Ionicons name="airplane-outline" size={26} color="#FFA500" /> }, // oranje
    { id: 'other', text: 'Other …', icon: <Ionicons name="chatbubble-ellipses-outline" size={26} color="#2ECC71" /> }, // groen
  ];

  const levelOptions = [
    { id: 1, text: 'Darija is completely new to me', level: 0 },
    { id: 2, text: 'I know a few common words', level: 1 },
    { id: 3, text: 'I can handle simple conversations', level: 2 },
    { id: 4, text: 'I can talk about different everyday topics', level: 3 },
    { id: 5, text: 'I can discuss most topics in detail', level: 4 },
  ];

  const learningGoalOptions = [
    { id: '5min', text: '5 min/day (Relaxed)', time: 5 },
    { id: '10min', text: '10 min/day (Standard)', time: 10 },
    { id: '15min', text: '15 min/day (Serious)', time: 15 },
    { id: '20min', text: '20 min/day (Intense)', time: 20 },
  ];

  const encouragementBenefits = [
    { id: 'confidence', text: 'Build confidence in conversations', icon: '💪' },
    { id: 'vocabulary', text: 'Expand your vocabulary quickly', icon: '📚' },
    { id: 'habit', text: 'Develop a lasting learning habit', icon: '🎯' },
  ];

  const getMotivationMessage = () => {
    switch (selectedLearningGoal) {
      case '5min':
        return 'Awesome, that\'s 25 words per week!';
      case '10min':
        return 'Awesome, that\'s 50 words per week!';
      case '15min':
        return 'Awesome, that\'s 75 words per week!';
      case '20min':
        return 'Awesome, that\'s 100 words per week!';
      default:
        return 'Awesome, that\'s 50 words per week!';
    }
  };

  const renderProgressBars = (level: number) => {
    const bars = [];
    for (let i = 0; i < 4; i++) {
      bars.push(
        <View
          key={i}
          style={[
            styles.progressBar,
            i < level ? styles.activeBar : styles.inactiveBar
          ]}
        />
      );
    }
    return <View style={styles.progressBarsContainer}>{bars}</View>;
  };

  const renderContent = () => {
    switch (currentStep) {
      case 'intro':
        return (
          <View style={styles.introContainer}>
            <View style={styles.headerRowColumn}>
            <MotiImage
              source={safiLogo}
              style={styles.mascotImage}
              resizeMode="contain"
              from={{ translateY: 0 }}
              animate={{ translateY: -20 }}
              transition={{
                type: 'timing',
                duration: 800,
                loop: true,          // zorgt dat hij blijft loopen
                repeatReverse: true, // zorgt dat hij weer terug gaat
              }}
            />
              <View style={styles.speechBubble}>
              <View style={styles.speechTailTopBorder} />
              <View style={styles.speechTailTop} />
                <Text style={styles.speechText}>
                  Hi! I'm Safi, your friend in learning Darija.
                </Text>
              </View>
            </View>
          </View>
        );
  
      case 'questions-intro':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.headerRowColumn}>
              <Image
                source={safiLogo}
                style={styles.mascotImage}
                resizeMode="contain"
                fadeDuration={0}
              />
              <View style={styles.speechBubble}>
              <View style={styles.speechTailTopBorder} />
              <View style={styles.speechTailTop} />
                <Text style={styles.speechText}>
                  Let's get to know you! Just 4 quick questions before we start your first lesson
                </Text>
              </View>
            </View>
          </View>
        );
  

        case 'discover-source':
          return (
            <View style={styles.contentContainer}>
              <View style={styles.headerRow}>
                <Image 
                  source={safiLogo}     // 👈 hier, niet opnieuw require
                  style={styles.mascotImageTiny}
                  resizeMode="contain"
                  fadeDuration={0}
                />
                <View style={styles.speechBubbleSmall}>
                  <View style={styles.speechTailBorder} />
                  <View style={styles.speechTail} />
                  <Text style={styles.speechTextTiny}>
                    How did you discover SafiSpeak?
                  </Text>
                </View>
              </View>
      
            <View style={styles.optionsContainer}>
              {discoverOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    selectedSource === option && styles.optionButtonSelected
                  ]}
                  onPress={() => setSelectedSource(option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedSource === option && styles.optionTextSelected
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
        

        case 'motivation':
          return (
            <View style={styles.contentContainer}>
              {/* Header met Safi logo + vraag */}
              <View style={styles.headerRow}>
                <Image
                  source={safiLogo}
                  style={styles.mascotImageTiny}
                  resizeMode="contain"
                  fadeDuration={0}
                />
                <View style={styles.speechBubbleSmall}>
                  <View style={styles.speechTailBorder} />
                  <View style={styles.speechTail} />
                  <Text style={styles.speechTextTiny}>
                    Why do you want to learn Darija?
                  </Text>
                </View>
              </View>
        
              {/* Opties */}
              <View style={styles.motivationOptionsContainer}>
                {motivationOptions.map((option) => {
                  const isSelected = selectedMotivations.includes(option.id);
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.motivationOptionButton,
                        isSelected && styles.motivationOptionSelected,
                      ]}
                      onPress={() => {
                        if (isSelected) {
                          setSelectedMotivations(
                            selectedMotivations.filter((id) => id !== option.id)
                          );
                        } else {
                          setSelectedMotivations([...selectedMotivations, option.id]);
                        }
                      }}
                    >
                      <View style={styles.motivationOptionContent}>
                        {/* Emoji icoon */}
                        <Text style={styles.motivationIcon}>{option.icon}</Text>
        
                        {/* Tekst */}
                        <Text
                          style={[
                            styles.motivationText,
                            isSelected && styles.motivationTextSelected,
                          ]}
                        >
                          {option.text}
                        </Text>
                      </View>
        
                      {/* Checkbox */}
                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkboxSelected,
                        ]}
                      >
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        

               case 'darija-level':
           return (
             <View style={styles.contentContainer}>
               <View style={styles.headerRow}>
                 <Image
                   source={safiLogo}
                   style={styles.mascotImageTiny}
                   resizeMode="contain"
                   fadeDuration={0}
                 />
                 <View style={styles.speechBubbleSmall}>
                   <View style={styles.speechTailBorder} />
                   <View style={styles.speechTail} />
                   <Text style={styles.speechTextTiny}>
                     How good is your Darija?
                   </Text>
                 </View>
               </View>
               <View style={styles.optionsContainer}>
                 {levelOptions.map((option) => (
                   <TouchableOpacity
                     key={option.id}
                     style={[
                       styles.levelOptionButton,
                       selectedLevel === option.id && styles.optionButtonSelected
                     ]}
                     onPress={() => setSelectedLevel(option.id)}
                   >
                     <View style={styles.levelOptionContent}>
                       <Text style={[
                         styles.levelOptionText,
                         selectedLevel === option.id && styles.optionTextSelected
                       ]}>
                         {option.text}
                       </Text>
                       {renderProgressBars(option.level)}
                     </View>
                   </TouchableOpacity>
                 ))}
               </View>
             </View>
           );

                   case 'learning-goal':
            return (
              <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                  <Image
                    source={safiLogo}
                    style={styles.mascotImageTiny}
                    resizeMode="contain"
                    fadeDuration={0}
                  />
                  <View style={styles.speechBubbleSmall}>
                    <View style={styles.speechTailBorder} />
                    <View style={styles.speechTail} />
                    <Text style={styles.speechTextTiny}>
                      What is your daily learning goal?
                    </Text>
                  </View>
                </View>
                <View style={styles.optionsContainer}>
                  {learningGoalOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionButton,
                        selectedLearningGoal === option.id && styles.optionButtonSelected
                      ]}
                      onPress={() => setSelectedLearningGoal(option.id)}
                    >
                      <Text style={[
                        styles.optionText,
                        selectedLearningGoal === option.id && styles.optionTextSelected
                      ]}>
                        {option.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
                         );

           case 'motivation-goal':
             return (
               <View style={styles.contentContainer}>
                 <View style={styles.headerRowColumn}>
                   <Image
                     source={safiLogo}
                     style={styles.mascotImage}
                     resizeMode="contain"
                     fadeDuration={0}
                   />
                   <View style={styles.speechBubble}>
                     <View style={styles.speechTailTopBorder} />
                     <View style={styles.speechTailTop} />
                     <Text style={styles.speechText}>
                       {getMotivationMessage()}
                     </Text>
                   </View>
                 </View>
               </View>
             );

             case 'notifications-permission':
              return (
                <View style={styles.contentContainer}>
                  <View style={styles.headerRow}>
                    <Image
                      source={safiLogo}
                      style={styles.mascotImage}
                      resizeMode="contain"
                      fadeDuration={0}
                    />
                    <View style={[styles.speechBubble, styles.bubbleCompact, styles.bubbleShift]}>
                      <View style={[styles.speechTailBorder, styles.bubbleTailY]} />
                      <View style={[styles.speechTail, styles.bubbleTailY]} />
                      <Text style={[styles.speechText, styles.bubbleTextCompact]}>
                        My reminders help make learning a habit!
                      </Text>
                    </View>
                  </View>
            
                  <View style={styles.notificationPermissionContainer}>
                    <View style={[styles.notificationBox, styles.notificationBoxCompact]}>
                      <Text style={[styles.notificationTitle, styles.notificationTitleCompact]}>
                        SafiSpeak would like to send you notifications
                      </Text>
                      <Text style={[styles.notificationSubtitle, styles.notificationSubtitleCompact]}>
                        This app would like to send you notifications to help you stay on track with your learning goals.
                      </Text>
            
                      <View style={[styles.notificationButtons, styles.notificationButtonsTight]}>
                        <TouchableOpacity
                          style={[
                            styles.notificationButton,
                            styles.notificationButtonSecondary,
                            styles.notificationButtonTight,
                            notificationPermission === 'denied' && styles.notificationButtonSelected
                          ]}
                          onPress={() => setNotificationPermission('denied')}
                        >
                          <Text style={[
                            styles.notificationButtonText,
                            styles.notificationButtonTextSecondary,
                            notificationPermission === 'denied' && styles.notificationButtonTextSelected
                          ]}>
                            Don't Allow
                          </Text>
                        </TouchableOpacity>
            
                        <TouchableOpacity
                          style={[
                            styles.notificationButton,
                            styles.notificationButtonPrimary,
                            styles.notificationButtonTight,
                            notificationPermission === 'granted' && styles.notificationButtonSelected
                          ]}
                          onPress={requestNotificationPermission}
                        >
                          <Text style={[
                            styles.notificationButtonText,
                            styles.notificationButtonTextPrimary,
                            notificationPermission === 'granted' && styles.notificationButtonTextSelected
                          ]}>
                            Allow
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              );
            

           case 'encouragement':
             return (
               <View style={styles.contentContainer}>
                 <View style={styles.headerRow}>
                   <Image
                     source={safiLogo}
                     style={styles.mascotImage}
                     resizeMode="contain"
                     fadeDuration={0}
                   />
                  <View style={[styles.speechBubble, styles.bubbleCompact]}>
                    <View style={styles.speechTailBorder} />
                    <View style={styles.speechTail} />
                    <Text style={[styles.speechText, styles.bubbleTextCompact]}>
                      You can achieve this in 2 months!
                    </Text>
                  </View>

                 </View>
                 <View style={styles.encouragementContainer}>
                   {encouragementBenefits.map((benefit) => (
                     <View key={benefit.id} style={styles.encouragementBenefit}>
                       <Text style={styles.encouragementIcon}>{benefit.icon}</Text>
                       <Text style={styles.encouragementText}>{benefit.text}</Text>
                     </View>
                   ))}
                 </View>
               </View>
             );

           case 'intro-first-lesson':
             return (
               <View style={styles.contentContainer}>
                 <View style={styles.headerRowColumn}>
                   <Image
                     source={safiLogo}
                     style={styles.mascotImage}
                     resizeMode="contain"
                     fadeDuration={0}
                   />
                   <View style={styles.speechBubble}>
                     <View style={styles.speechTailTopBorder} />
                     <View style={styles.speechTailTop} />
                     <Text style={styles.speechText}>
                       Great! Here's your first lesson — just 2 minutes to get started 🚀
                     </Text>
                   </View>
                 </View>
                 <View style={styles.startLessonContainer}>
                                       <TouchableOpacity
                      style={styles.startLessonButton}
                      onPress={() => router.push('/lessons/1')}
                    >
                     <Text style={styles.startLessonButtonText}>
                       START LESSON
                     </Text>
                   </TouchableOpacity>
                 </View>
               </View>
             );

           default:
             return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with back button and progress bar */}
      {currentStep !== 'intro' && (
        <View style={[styles.header, { paddingTop: safeTop + 10 }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
                     {(currentStep === 'discover-source' || currentStep === 'motivation' || currentStep === 'darija-level' || currentStep === 'learning-goal' || currentStep === 'motivation-goal' || currentStep === 'notifications-permission' || currentStep === 'encouragement' || currentStep === 'intro-first-lesson') && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground} />
              <View style={[styles.progressFill, { width: getProgressWidth() }]} />
            </View>
          )}
        </View>
      )}

             {/* Main content */}
       <ScrollView 
         style={styles.content} 
         contentContainerStyle={styles.contentContainerStyle}
         showsVerticalScrollIndicator={false}
       >
         {renderContent()}
       </ScrollView>

      {/* Bottom button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !canProceed() && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={!canProceed()}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === 'intro' ? 'NEXT' : 
             currentStep === 'questions-intro' ? 'LET\'S GO' : 
             'CONTINUE'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  headerRow: { flexDirection: 'row', 
    alignItems: 'center', 
    width: '100%', 
    paddingHorizontal: 0, 
    marginBottom: 32, 
    gap: 12 },

  headerRowColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    marginBottom: 32,
    gap: 12,
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
  },
  progressContainer: {
    flex: 1,
    height: 8,
    position: 'relative',
  },
  progressBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00A86B',
    borderRadius: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 40,
  },
  contentContainerStyle:  { paddingTop: 16, paddingBottom: 24, flexGrow: 1 },

  introContainer: {
    marginTop: 180, // alleen intro meer ruimte van boven
  },

  contentContainer: {
    alignItems: 'stretch',
  },
  mascotContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  mascotImage: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
  },
  mascotImageSmall: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  speechBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#E5E5E5',
    padding: 20,
    flexShrink: 2,
    maxWidth: width * 0.8,
    marginBottom: 20,
    marginTop: 4
  },
  speechText: {
    fontSize: 20,
    fontFamily: 'Baloo2-Medium',
    color: '#333',
    textAlign: 'left',
    lineHeight: 28,
  },
  speechTextSmall: {
    fontSize: 16,
    fontFamily: 'Baloo2-Medium',
    color: '#333',
    textAlign: 'left',
    lineHeight: 22,
  },

  mascotImageTiny: {
    width: 90,       
    height: 90,      
    marginRight: 12,  
  },

  speechBubbleSmall: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    padding: 15,
    position: 'relative',
    maxWidth: '75%',
  },
  speechTextTiny: {
    fontSize: 14,
    fontFamily: 'Baloo2-Medium',
    color: '#333',
    lineHeight: 18,
  },
  speechTail: {
    position: 'absolute',
    left: -9,
    top: '50%',
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderTopColor: 'transparent',
    borderBottomWidth: 8,
    borderBottomColor: 'transparent',
    borderRightWidth: 10,
    borderRightColor: '#FFFFFF',
    zIndex: 2,
  },
  speechTailBorder: {
    position: 'absolute',
    left: -11,
    top: '50%',
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderTopColor: 'transparent',
    borderBottomWidth: 8,
    borderBottomColor: 'transparent',
    borderRightWidth: 10,
    borderRightColor: '#E5E5E5',
    zIndex: 1,
  },

speechTailTop: {
  position: 'absolute',
  top: -8,
  left: '50%',
  marginLeft: -1,
  width: 0,
  height: 0,
  borderLeftWidth: 10,
  borderLeftColor: 'transparent',
  borderRightWidth: 10,
  borderRightColor: 'transparent',
  borderBottomWidth: 10,
  borderBottomColor: '#FFFFFF',
  zIndex: 2,
},
speechTailTopBorder: {
  position: 'absolute',
  top: -11,
  left: '50%',
  marginLeft: -1,
  width: 0,
  height: 0,
  borderLeftWidth: 11,
  borderLeftColor: 'transparent',
  borderRightWidth: 11,
  borderRightColor: 'transparent',
  borderBottomWidth: 11,
  borderBottomColor: '#E5E5E5',
  zIndex: 1,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Baloo2-Medium',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Baloo2-Medium',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  questionContainer: {
    marginBottom: 40,
  },
  question: {
    fontSize: 28,
    fontFamily: 'Baloo2-Bold',
    color: '#333',
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  optionButtonSelected: {
    borderColor: '#00A86B',
    backgroundColor: '#F0FFF4',
    elevation: 3,
    shadowOpacity: 0.15,
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Baloo2-Medium',
    color: '#333',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#00A86B',
  },
  levelOptionButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  levelOptionContent: {
    alignItems: 'center',
  },
  levelOptionText: {
    fontSize: 15,
    fontFamily: 'Baloo2-Medium',
    color: '#333',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 16,
  },
  progressBarsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  progressBar: {
    width: 20,
    height: 4,
    borderRadius: 2,
  },
  activeBar: {
    backgroundColor: '#00A86B',
  },
  inactiveBar: {
    backgroundColor: '#E5E5E5',
  },
  motivationOptionsContainer: {
    width: '100%',
  },
  motivationOptionButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  motivationOptionSelected: {
    borderColor: '#00A86B',
    backgroundColor: '#F0FFF4',
    elevation: 4,
    shadowOpacity: 0.15,
  },
  motivationOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  motivationIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  motivationText: {
    fontSize: 16,
    fontFamily: 'Baloo2-Medium',
    color: '#333',
    flex: 1,
  },
  motivationTextSelected: {
    color: '#00A86B',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: '#00A86B',
    backgroundColor: '#00A86B',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Baloo2-Medium',
  },
  bottomContainer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  nextButton: {
    backgroundColor: '#00A86B',
    paddingVertical: 18,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  nextButtonDisabled: {
    backgroundColor: '#E5E5E5',
    elevation: 0,
    shadowOpacity: 0,
  },
     nextButtonText: {
     fontSize: 16,
     fontFamily: 'Baloo2-Bold',
     color: '#FFFFFF',
     textAlign: 'center',
     letterSpacing: 1,
   },
   notificationPermissionContainer: {
     width: '100%',
     marginTop: 20,
   },
   notificationBox: {
     backgroundColor: '#FFFFFF',
     borderWidth: 1,
     borderColor: '#E5E5E5',
     borderRadius: 12,
     padding: 20,
     elevation: 2,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.1,
     shadowRadius: 4,
   },
   notificationTitle: {
     fontSize: 18,
     fontFamily: 'Baloo2-Medium',
     color: '#333',
     marginBottom: 8,
     textAlign: 'center',
   },
   notificationSubtitle: {
     fontSize: 14,
     fontFamily: 'Baloo2-Medium',
     color: '#666',
     textAlign: 'center',
     lineHeight: 20,
     marginBottom: 20,
   },
   notificationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12, // werkt in RN 0.71+, anders gebruik marginRight
  },
  notificationButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  notificationButtonPrimary: {
    backgroundColor: '#00A86B',
  },
  
  notificationButtonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#00A86B',
  },
  
  notificationButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  notificationButtonTextPrimary: {
    color: '#FFFFFF',
  },
  
  notificationButtonTextSecondary: {
    color: '#00A86B',
  },
       notificationButtonTextSelected: {
      color: '#00A86B',
    },
    encouragementContainer: {
      width: '100%',
      marginTop: 20,
    },
    encouragementBenefit: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E5E5E5',
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginBottom: 12,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    encouragementIcon: {
      fontSize: 24,
      marginRight: 16,
    },
    encouragementText: {
      fontSize: 16,
      fontFamily: 'Baloo2-Medium',
      color: '#333',
      flex: 1,
    },

    bubbleCompact: {
      maxWidth: '68%',     // smaller than before
      padding: 14,
      borderRadius: 16,
    },
    bubbleTextCompact: {
      fontSize: 16,
      lineHeight: 22,
    },
    bubbleTailY: {
      top: 24,             // i.p.v. '50%' → sluit netter aan
    },
    bubbleShift: {
      marginTop: 4,        // mini offset zodat hij “klikt” met de mascot
    },

    notificationBoxCompact: {
      width: '88%',
      alignSelf: 'center',
      padding: 16,
      borderRadius: 14,
      shadowOpacity: 0.08,
    },
    notificationTitleCompact: {
      fontSize: 16,
      lineHeight: 22,
    },
    notificationSubtitleCompact: {
      fontSize: 13,
      lineHeight: 18,
    },
    notificationButtonsTight: {
      gap: 10,
    },
         notificationButtonTight: {
       paddingVertical: 10,
       borderRadius: 10,
     },
     notificationButtonSelected: {
       backgroundColor: '#e6f7e6', // voorbeeld: lichtgroen
       borderColor: '#2ecc71',     // voorbeeld: groen randje
     },
     startLessonContainer: {
       width: '100%',
       marginTop: 40,
       alignItems: 'center',
     },
     startLessonButton: {
       backgroundColor: '#00A86B',
       paddingVertical: 20,
       paddingHorizontal: 40,
       borderRadius: 16,
       elevation: 3,
       shadowColor: '#000',
       shadowOffset: { width: 0, height: 3 },
       shadowOpacity: 0.2,
       shadowRadius: 6,
       minWidth: 200,
     },
     startLessonButtonText: {
       fontSize: 18,
       fontFamily: 'Baloo2-Bold',
       color: '#FFFFFF',
       textAlign: 'center',
       letterSpacing: 1,
     },
   });
