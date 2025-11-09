import { createClient } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

interface SigninModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SigninModal: React.FC<SigninModalProps> = ({ visible, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSignin = async () => {
    if (!email || !password) {
      return;
    }

    setIsSubmitting(true);
    setEmailError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setEmailError('Invalid email or password. Please try again.');
        } else {
          setEmailError('Error signing in. Please try again.');
        }
        return;
      }

      if (data.user) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.log('Signin error:', error);
      setEmailError('Error signing in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    try {
      console.log('Starting Google OAuth...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'safispeak://auth/callback',
          queryParams: {
            prompt: 'consent',
            access_type: 'offline',
          },
        },
      });

      if (error) {
        console.log('OAuth error:', error);
        return;
      }

      if (data?.url) {
        console.log('Opening auth URL:', data.url);
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          'safispeak://auth/callback'
        );
        console.log('Auth result:', result);

        if (result.type === 'success' && result.url) {
          const url = new URL(result.url);
          const fragment = url.hash.substring(1);
          const params = new URLSearchParams(fragment);
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');

          if (access_token && refresh_token) {
            console.log('Setting session with tokens...');
            const { error: sessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (sessionError) {
              console.log('Error setting session:', sessionError);
            } else {
              console.log('Session set successfully!');
              onSuccess();
              onClose();
            }
          }
        }
      }
    } catch (err) {
      console.log('Google login error:', err);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.signinModal}>
      <ScrollView style={styles.signinScrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.signinScrollContent}>
          {/* Header */}
          <View style={styles.signinHeader}>
            <TouchableOpacity onPress={onClose} style={styles.signinCloseButton}>
              <Text style={styles.signinCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.signinTitle}>Sign In</Text>
            <Image source={require('@/assets/images/logo_new_black.png')} style={styles.signinTitleMascot} />
          </View>

          {/* Email Form */}
          <View style={styles.emailFormContainer}>
            <View style={styles.emailFormFields}>
              <View style={styles.emailFormField}>
                <Text style={styles.emailFormLabel}>Email *</Text>
                <TextInput
                  style={styles.emailFormInput}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>

              <View style={styles.emailFormField}>
                <Text style={styles.emailFormLabel}>Password *</Text>
                <TextInput
                  style={styles.emailFormInput}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.emailFormSubmitButton,
                (!email || !password || isSubmitting) &&
                styles.emailFormSubmitButtonDisabled
              ]}
              onPress={handleEmailSignin}
              disabled={!email || !password || isSubmitting}
            >
              <Text style={styles.emailFormSubmitButtonText}>
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.signinDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Button */}
          <Pressable
            style={({ pressed }) => [
              styles.googleSigninButton,
              { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
            onPress={handleGoogleLogin}
          >
            <Image source={require('@/assets/images/google_light_login.png')} style={styles.googleSigninLogo} resizeMode="contain" />
            <Text style={styles.googleSigninButtonText}>Continue with Google</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  signinModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  signinScrollView: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    maxHeight: '90%',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  signinScrollContent: {
    padding: 20,
  },
  signinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  signinCloseButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signinCloseText: {
    fontSize: 18,
    color: '#666',
  },
  signinTitle: {
    fontSize: 24,
    fontFamily: 'Baloo2-Bold',
    color: '#00A86B',
    textAlign: 'center',
  },
  signinTitleMascot: {
    width: 40,
    height: 40,
    marginLeft: 10,
  },
  emailFormContainer: {
    marginTop: -30,
  },
  emailFormFields: {
    gap: 15,
  },
  emailFormField: {
    marginBottom: 10,
  },
  emailFormLabel: {
    fontSize: 16,
    fontFamily: 'Baloo2-Medium',
    color: '#333',
    marginBottom: 8,
  },
  emailFormInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Baloo2-Medium',
    backgroundColor: '#F9F9F9',
  },
  emailFormSubmitButton: {
    backgroundColor: '#00A86B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  emailFormSubmitButtonDisabled: {
    backgroundColor: '#00A86B',
    opacity: 0.6,
  },
  emailFormSubmitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Baloo2-Bold',
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 14,
    fontFamily: 'Baloo2-Medium',
    marginTop: 5,
  },
  signinDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Baloo2-Medium',
  },
  googleSigninButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleSigninLogo: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleSigninButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Baloo2-Medium',
  },
});

export default SigninModal;
