import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthService } from '../services/authService';

interface SignupModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SignupModal({ visible, onClose, onSuccess }: SignupModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupMethod, setSignupMethod] = useState<'email' | 'magic' | 'social'>('email');

  console.log('SignupModal rendered with visible:', visible);

  const handleEmailSignup = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { data, error } = await AuthService.signUpWithEmail(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Signup Error', error.message);
    } else {
      Alert.alert(
        'Success! 🎉',
        'Safi! Your progress is saved. Please check your email to verify your account.',
        [{ text: 'OK', onPress: onSuccess }]
      );
    }
  };

  const handleMagicLinkSignup = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    const { data, error } = await AuthService.signUpWithMagicLink(email);
    setLoading(false);

    if (error) {
      Alert.alert('Magic Link Error', error.message);
    } else {
      Alert.alert(
        'Check Your Email! 📧',
        'We sent you a magic link to sign in. Check your email and click the link.',
        [{ text: 'OK', onPress: onSuccess }]
      );
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    const { data, error } = await AuthService.signInWithGoogle();
    setLoading(false);

    if (error) {
      Alert.alert('Google Signup Error', error.message);
    } else {
      Alert.alert('Success! 🎉', 'Safi! Your progress is saved.');
      onSuccess();
    }
  };

  const handleAppleSignup = async () => {
    setLoading(true);
    const { data, error } = await AuthService.signInWithApple();
    setLoading(false);

    if (error) {
      Alert.alert('Apple Signup Error', error.message);
    } else {
      Alert.alert('Success! 🎉', 'Safi! Your progress is saved.');
      onSuccess();
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setSignupMethod('email');
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Create Free Account</Text>
              <Text style={styles.subtitle}>Save your progress and continue learning</Text>
            </View>

            {/* Signup Methods */}
            <View style={styles.methodContainer}>
              <TouchableOpacity
                style={[styles.methodButton, signupMethod === 'email' && styles.methodButtonActive]}
                onPress={() => setSignupMethod('email')}
              >
                <Text style={[styles.methodButtonText, signupMethod === 'email' && styles.methodButtonTextActive]}>
                  Email & Password
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.methodButton, signupMethod === 'magic' && styles.methodButtonActive]}
                onPress={() => setSignupMethod('magic')}
              >
                <Text style={[styles.methodButtonText, signupMethod === 'magic' && styles.methodButtonTextActive]}>
                  Magic Link
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.methodButton, signupMethod === 'social' && styles.methodButtonActive]}
                onPress={() => setSignupMethod('social')}
              >
                <Text style={[styles.methodButtonText, signupMethod === 'social' && styles.methodButtonTextActive]}>
                  Social Login
                </Text>
              </TouchableOpacity>
            </View>

            {/* Email & Password Form */}
            {signupMethod === 'email' && (
              <View style={styles.formContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleEmailSignup}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Create Account</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Magic Link Form */}
            {signupMethod === 'magic' && (
              <View style={styles.formContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleMagicLinkSignup}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Send Magic Link</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Social Login */}
            {signupMethod === 'social' && (
              <View style={styles.socialContainer}>
                <TouchableOpacity
                  style={[styles.socialButton, styles.googleButton, loading && styles.submitButtonDisabled]}
                  onPress={handleGoogleSignup}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.socialButtonText}>Continue with Google</Text>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.socialButton, styles.appleButton, loading && styles.submitButtonDisabled]}
                  onPress={handleAppleSignup}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.socialButtonText}>Continue with Apple</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Terms & Privacy */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By creating an account, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Nunito_700Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Nunito_400Regular',
  },
  methodContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  methodButtonActive: {
    backgroundColor: '#00A86B',
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Nunito_600SemiBold',
  },
  methodButtonTextActive: {
    color: '#fff',
  },
  formContainer: {
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    fontFamily: 'Nunito_400Regular',
  },
  submitButton: {
    backgroundColor: '#00A86B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Nunito_700Bold',
  },
  socialContainer: {
    marginBottom: 30,
  },
  socialButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  appleButton: {
    backgroundColor: '#000',
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Nunito_600SemiBold',
  },
  termsContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: 'Nunito_400Regular',
  },
  termsLink: {
    color: '#00A86B',
    textDecorationLine: 'underline',
  },
});
