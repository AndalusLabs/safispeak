import { MotiImage } from 'moti';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const safiLogo = require('@/assets/images/logo_new_black.png');

interface AccountPromptScreenProps {
  onCreateAccount: () => void;
  onContinueWithoutAccount: () => void;
}

const AccountPromptScreen: React.FC<AccountPromptScreenProps> = ({
  onCreateAccount,
  onContinueWithoutAccount,
}) => {
  return (
    <View style={styles.container}>
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
              <Text style={styles.speechMessage}>
                To track your progress, we ask you to create an account.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.createAccountButton} onPress={onCreateAccount}>
          <Text style={styles.createAccountButtonText}>CREATE ACCOUNT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.continueButton} onPress={onContinueWithoutAccount}>
          <Text style={styles.continueButtonText}>Continue without account</Text>
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
  bottomContainer: {
    paddingHorizontal: 32,
    paddingBottom: 40,
    paddingTop: 16,
    gap: 12,
  },
  createAccountButton: {
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
  createAccountButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Baloo2-Bold',
  },
  continueButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 150,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  continueButtonText: {
    color: '#333',
    fontSize: 18,
    fontFamily: 'Baloo2-Medium',
  },
});

export default AccountPromptScreen;

