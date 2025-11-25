import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const safeTop = insets.top || 20;
  const { isAuthenticated, user, profile, loading, refreshProfile } = useAuth();

  const displayName =
    profile?.display_name?.trim() ||
    user?.email?.split('@')[0] ||
    'Darija Explorer';
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString()
    : null;
  const emailStatus = user?.emailConfirmedAt ? 'Verified' : 'Not verified';
  const isEmailVerified = emailStatus === 'Verified';

  const handleCreateProfile = () => {
    router.push('/lessons/1?fromProfile=true');
  };

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        refreshProfile();
      }
    }, [isAuthenticated, refreshProfile])
  );

  return (
    <View style={styles.container}>
      <View style={[styles.hero, { paddingTop: safeTop + 10 }]}>
        <View style={styles.heroAccent} />
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.heroContent}>
          <Text style={styles.heroEyebrow}>Profile</Text>
          <Text style={styles.heroTitle}>My Profile</Text>
          <Text style={styles.heroSubtitle}>
            Manage how you show up across the lessons.
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#00A86B" />
            <Text style={styles.loadingText}>Loading your profile...</Text>
          </View>
        ) : isAuthenticated ? (
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{displayName[0]?.toUpperCase()}</Text>
            </View>
            <Text style={styles.profileName}>{displayName}</Text>
            {user?.email ? (
              <View style={styles.emailRow}>
                <Text style={styles.profileEmail}>{user.email}</Text>
                <View
                  style={[
                    styles.emailStatusBadge,
                    isEmailVerified ? styles.emailStatusBadgeVerified : styles.emailStatusBadgePending,
                  ]}
                >
                  <Text
                    style={[
                      styles.emailStatusText,
                      isEmailVerified ? styles.emailStatusTextVerified : styles.emailStatusTextPending,
                    ]}
                  >
                    {emailStatus}
                  </Text>
                </View>
              </View>
            ) : null}
            {memberSince ? (
              <Text style={styles.profileMeta}>Member since {memberSince}</Text>
            ) : null}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No profile yet</Text>
            <Text style={styles.emptySubtitle}>
              Create a profile to save your progress and keep learning in sync across devices.
            </Text>
            <TouchableOpacity style={styles.ctaButton} onPress={handleCreateProfile}>
              <Text style={styles.ctaButtonText}>Create a profile to save your progress</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  hero: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  heroAccent: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 280,
    height: 280,
    backgroundColor: '#00A86B',
    opacity: 0.18,
    borderRadius: 140,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00A86B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#00A86B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  heroContent: {
    gap: 6,
  },
  heroEyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontSize: 12,
    color: '#00A86B',
    fontFamily: 'Baloo2-Bold',
  },
  heroTitle: {
    fontSize: 36,
    color: '#1F2A37',
    fontFamily: 'Baloo2-Bold',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#4B5563',
    fontFamily: 'Baloo2-Medium',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  profileCard: {
    alignItems: 'center',
    padding: 28,
    borderRadius: 24,
    backgroundColor: '#F4FBF7',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#00A86B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontFamily: 'Baloo2-Bold',
  },
  profileName: {
    fontSize: 24,
    fontFamily: 'Baloo2-Bold',
    color: '#111827',
  },
  profileEmail: {
    fontSize: 16,
    color: '#4B5563',
    fontFamily: 'Baloo2-Medium',
    marginTop: 6,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  emailStatusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  emailStatusBadgeVerified: {
    backgroundColor: '#E8F5E9',
  },
  emailStatusBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  emailStatusText: {
    fontSize: 12,
    fontFamily: 'Baloo2-Bold',
  },
  emailStatusTextVerified: {
    color: '#256029',
  },
  emailStatusTextPending: {
    color: '#92400E',
  },
  profileMeta: {
    fontSize: 13,
    color: '#94A3B8',
    fontFamily: 'Baloo2-Medium',
    marginTop: 8,
  },
  loadingState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontFamily: 'Baloo2-Medium',
    color: '#4B5563',
  },
  emptyState: {
    padding: 28,
    borderRadius: 24,
    backgroundColor: '#F8FAFB',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: 'Baloo2-Bold',
    color: '#111827',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: 'Baloo2-Medium',
    color: '#475569',
    lineHeight: 20,
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: '#00A86B',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Baloo2-Bold',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
});

export default ProfileScreen;

