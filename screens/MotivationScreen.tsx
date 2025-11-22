import { MotiImage } from 'moti';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const safiLogo = require('@/assets/images/logo_new_black.png');

interface MotivationScreenProps {
  title?: string;
  message?: string;
  buttonText: string;
  progress: number; // 1, 2, or 3
  onContinue: () => void;
  onBack?: () => void;
  username?: string;
  skippedAccount?: boolean;
}

const MotivationScreen: React.FC<MotivationScreenProps> = ({
  title,
  message,
  buttonText,
  progress,
  onContinue,
  onBack,
  username,
  skippedAccount,
}) => {
  const safeTop = useSafeAreaInsets().top;
  
  // Determine title and message based on username and skippedAccount
  let displayTitle = title;
  let displayMessage = message;
  
  // Priority: skippedAccount check first, then username
  if (skippedAccount) {
    displayTitle = undefined;
    displayMessage = `You can always create an account afterwards so you can track your progress. Let's continue to the sentences for now!`;
  } else if (username) {
    displayTitle = undefined;
    displayMessage = `Hi ${username}, now you can track your progress! Let's move on to the sentences!`;
  }
  
  return (
    <View style={styles.container}>
      {/* Header with back button */}
      {onBack && (
        <View style={[styles.header, { paddingTop: safeTop + 10 }]}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Main content */}
      <View style={styles.body}>
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
                loop: true,
                repeatReverse: true,
              }}
            />
            <View style={styles.speechBubble}>
              <View style={styles.speechTailTopBorder} />
              <View style={styles.speechTailTop} />
              {displayTitle && <Text style={styles.speechTitle}>{displayTitle}</Text>}
              <Text style={styles.speechMessage}>{displayMessage}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom button */}
      <View style={styles.bottomContainer}>
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
  },
  progressContainer: {
    width: '100%',
    height: 8,
    position: 'relative',
    justifyContent: 'center',
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
  body: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  introContainer: {
    marginTop: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  headerRowColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  mascotImage: {
    width: 160,
    height: 160,
  },
  speechBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#E5E5E5',
    padding: 20,
    maxWidth: width * 0.8,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  speechTitle: {
    fontSize: 22,
    fontFamily: 'Baloo2-Bold',
    color: '#00A86B',
    textAlign: 'center',
    marginBottom: 10,
  },
  speechMessage: {
    fontSize: 18,
    fontFamily: 'Baloo2-Medium',
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
  },
  speechTailTop: {
    position: 'absolute',
    top: -10,
    left: '52%',
    marginLeft: -11,
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
    top: -13,
    left: '52%',
    marginLeft: -12,
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
  messageText: {
    fontSize: 18,
    fontFamily: 'Baloo2-Medium',
    color: '#333',
    textAlign: 'center',
    lineHeight: 26,
  },
  bottomContainer: {
    paddingHorizontal: 32,
    paddingBottom: 40,
    paddingTop: 16,
  },
  continueButton: {
    backgroundColor: '#00A86B',
    borderRadius: 150,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 6,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Baloo2-Bold',
  },
});

export default MotivationScreen;
