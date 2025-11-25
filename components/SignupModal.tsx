import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Purchases from 'react-native-purchases';
import { clearAnonymousProfileId, getAnonymousProfileId } from '../services/anonymousProfileStorage';
import supabase from '../services/authService';

const { width } = Dimensions.get('window');

interface SignupModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (username: string) => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ visible, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate suggested username from email
  useEffect(() => {
    if (email && !username) {
      const suggestedUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      setUsername(suggestedUsername);
    }
  }, [email]);

  // Check username availability
  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (!usernameToCheck.trim()) {
      setUsernameError('');
      return;
    }

    setIsCheckingUsername(true);
    setUsernameError('');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', usernameToCheck)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.log('Error checking username:', error);
        setUsernameError('Error checking username availability');
        return;
      }

      if (data) {
        setUsernameError('Username is already taken.');
      } else {
        setUsernameError('');
      }
    } catch (error) {
      console.log('Error checking username:', error);
      setUsernameError('Error checking username availability');
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Debounced username check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (username) {
        checkUsernameAvailability(username);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleEmailSignup = async () => {
    if (!email || !username || !password) {
      return;
    }

    if (password.length < 6) {
      return;
    }

    if (usernameError) {
      return;
    }

    setIsSubmitting(true);
    setEmailError('');
    setUsernameError('');

    try {
      const anonymousProfileId = await getAnonymousProfileId();
      const signupMetadata: Record<string, string> = {
        preferred_username: username,
      };

      if (anonymousProfileId) {
        signupMetadata.profile_id = anonymousProfileId;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'safispeak://auth/callback',
          data: signupMetadata,
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setEmailError('Email already in use. Please use a different email address.');
        } else {
          setEmailError('Error creating account. Please try again.');
        }
        return;
      }

      const userId = data.user?.id;

      if (userId) {
        // Ensure we have an active session (signInWithPassword returns immediately when email confirmation is disabled)
        if (!data.session) {
          const { error: signinError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signinError) {
            console.log('Auto sign in error:', signinError);
            setEmailError('Account created, please log in to continue.');
            return;
          }
        }

        const postSignupResult = await upgradeProfileAfterSignup({
          anonymousProfileId,
          email,
          username,
          userId,
        });

        if (!postSignupResult.success) {
          setEmailError(postSignupResult.message ?? 'Error creating profile. Please try again.');
          return;
        }

        onSuccess(username);
        // Don't call onClose() here - let onSuccess handle navigation
      }
    } catch (error) {
      console.log('Signup error:', error);
      setEmailError('Error creating account. Please try again.');
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
              onSuccess('Google User');
              // Don't call onClose() here - let onSuccess handle navigation
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
    <View style={styles.signupModal}>
      <ScrollView style={styles.signupScrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.signupScrollContent}>
          {/* Header */}
          <View style={styles.signupHeader}>
            <TouchableOpacity onPress={onClose} style={styles.signupCloseButton}>
              <Text style={styles.signupCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.signupTitle}>Sign Up</Text>
            <Image source={require('@/assets/images/logo_new_black.png')} style={styles.signupTitleMascot} />
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
                <Text style={styles.emailFormLabel}>Username *</Text>
                <TextInput
                  style={styles.emailFormInput}
                  placeholder="Choose a username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {isCheckingUsername ? (
                  <Text style={styles.checkingText}>Checking availability...</Text>
                ) : usernameError ? (
                  <Text style={styles.errorText}>{usernameError}</Text>
                ) : null}
              </View>

              <View style={styles.emailFormField}>
                <Text style={styles.emailFormLabel}>Password *</Text>
                <TextInput
                  style={styles.emailFormInput}
                  placeholder="Minimum 6 characters"
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
                (!email || !username || !password || password.length < 6 || usernameError || isSubmitting) &&
                styles.emailFormSubmitButtonDisabled
              ]}
              onPress={handleEmailSignup}
              disabled={!email || !username || !password || password.length < 6 || !!usernameError || isSubmitting}
            >
              <Text style={styles.emailFormSubmitButtonText}>
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.signupDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Button */}
          <Pressable
            style={({ pressed }) => [
              styles.googleSignupButton,
              { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
            onPress={handleGoogleLogin}
          >
            <Image source={require('@/assets/images/google_light_login.png')} style={styles.googleSignupLogo} resizeMode="contain" />
            <Text style={styles.googleSignupButtonText}>Continue with Google</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

async function upgradeProfileAfterSignup({
  anonymousProfileId,
  userId,
  email,
  username,
}: {
  anonymousProfileId: string | null;
  userId: string;
  email: string;
  username: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const timestamp = new Date().toISOString();

    if (anonymousProfileId) {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_anonymous: false,
          username,
          display_name: username,
          email,
          auth_user_id: userId,
          updated_at: timestamp,
        })
        .eq('id', anonymousProfileId);

      if (error) {
        console.log('Profile upgrade error:', error);
        return { success: false, message: 'Error upgrading existing profile.' };
      }

      try {
        await Purchases.logIn(anonymousProfileId);
      } catch (purchaseError) {
        console.log('RevenueCat re-login error:', purchaseError);
      }

      await deleteAutoCreatedProfile(userId);
      await clearAnonymousProfileId();
      return { success: true };
    }

    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          auth_user_id: userId,
          username,
          display_name: username,
          email,
          is_anonymous: false,
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.log('Profile creation error:', error);
      return { success: false, message: 'Error creating profile. Please try again.' };
    }

    return { success: true };
  } catch (error) {
    console.log('Unexpected profile upgrade error:', error);
    return { success: false, message: 'Unexpected error. Please try again.' };
  }
}

async function deleteAutoCreatedProfile(newAuthUserId: string) {
  try {
    const { error } = await supabase.from('profiles').delete().eq('id', newAuthUserId);
    if (error && error.code !== 'PGRST116') {
      console.log('Cleanup profile delete error:', error);
    }
  } catch (error) {
    console.log('Unexpected cleanup profile delete error:', error);
  }
}

const styles = StyleSheet.create({
  signupModal: {
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
  signupScrollView: {
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
  signupScrollContent: {
    padding: 20,
  },
  signupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  signupCloseButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupCloseText: {
    fontSize: 18,
    color: '#666',
  },
  signupTitle: {
    fontSize: 24,
    fontFamily: 'Baloo2-Bold',
    color: '#00A86B',
    textAlign: 'center',
  },
  signupTitleMascot: {
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
    borderRadius: 150,
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
  checkingText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Baloo2-Medium',
    marginTop: 5,
  },
  signupDivider: {
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
  googleSignupButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 150,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleSignupLogo: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleSignupButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Baloo2-Medium',
  },
});

export default SignupModal;