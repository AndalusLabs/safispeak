import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Dimensions, Alert } from 'react-native';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  // Mock data - dit zou later uit de database komen
  const [userStats] = useState({
    streak: 7,
    totalXP: 1250,
    level: 3,
    lessonsCompleted: 12,
    rank: 'Bronze'
  });

  const handleStartLesson = () => {
    router.push('/lesson');
  };

  const handleViewProgress = () => {
    // Navigate to progress screen
    Alert.alert("Progress", "Progress scherm komt binnenkort!");
  };

  const handleViewLeaderboard = () => {
    // Navigate to leaderboard
    Alert.alert("Leaderboard", "Leaderboard komt binnenkort!");
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>SafiSpeak</Text>
        <Text style={styles.subtitle}>Leer Darija, Bouw Je Streak Op! 🔥</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={styles.statNumber}>{userStats.streak}</Text>
          <Text style={styles.statLabel}>Dagen Streak</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>⭐</Text>
          <Text style={styles.statNumber}>{userStats.totalXP}</Text>
          <Text style={styles.statLabel}>Totaal XP</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>📚</Text>
          <Text style={styles.statNumber}>{userStats.lessonsCompleted}</Text>
          <Text style={styles.statLabel}>Lessen</Text>
        </View>
      </View>

      {/* Daily Goal */}
      <View style={styles.dailyGoalContainer}>
        <Text style={styles.dailyGoalTitle}>Vandaag's Doel</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '75%' }]} />
        </View>
        <Text style={styles.dailyGoalText}>75% van je dagelijkse XP behaald</Text>
      </View>

      {/* Main Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleStartLesson}>
          <Text style={styles.primaryButtonText}>Start Dagelijkse Les</Text>
          <Text style={styles.primaryButtonSubtext}>+50 XP • 5 minuten</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={handleViewProgress}>
          <Text style={styles.secondaryButtonText}>Bekijk Progress</Text>
        </TouchableOpacity>
      </View>

      {/* Community Section */}
      <View style={styles.communityContainer}>
        <Text style={styles.sectionTitle}>Community</Text>
        
        <View style={styles.communityCard}>
          <Text style={styles.communityEmoji}>🏆</Text>
          <View style={styles.communityContent}>
            <Text style={styles.communityTitle}>Leaderboard</Text>
            <Text style={styles.communityDescription}>
              Je staat op plek #42 van 1,247 leerlingen
            </Text>
          </View>
          <TouchableOpacity style={styles.communityButton} onPress={handleViewLeaderboard}>
            <Text style={styles.communityButtonText}>Bekijk</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.communityCard}>
          <Text style={styles.communityEmoji}>👥</Text>
          <View style={styles.communityContent}>
            <Text style={styles.communityTitle}>Vrienden Uitdagen</Text>
            <Text style={styles.communityDescription}>
              Nodig vrienden uit en speel samen
            </Text>
          </View>
          <TouchableOpacity style={styles.communityButton}>
            <Text style={styles.communityButtonText}>Uitnodigen</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Snelle Acties</Text>
        
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionEmoji}>🎵</Text>
            <Text style={styles.quickActionText}>Luisteren</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionEmoji}>✍️</Text>
            <Text style={styles.quickActionText}>Schrijven</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionEmoji}>🗣️</Text>
            <Text style={styles.quickActionText}>Spreken</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionEmoji}>🧠</Text>
            <Text style={styles.quickActionText}>Review</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Streak Reminder */}
      <View style={styles.streakReminder}>
        <Text style={styles.streakReminderText}>
          🔥 Behoud je {userStats.streak}-daagse streak! Kom morgen terug voor +25 XP bonus.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1a1a2e',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#b0bec5',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  dailyGoalContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dailyGoalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 4,
  },
  dailyGoalText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: '#3498db',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  primaryButtonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3498db',
  },
  secondaryButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
  communityContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  communityCard: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  communityEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  communityContent: {
    flex: 1,
  },
  communityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  communityDescription: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  communityButton: {
    backgroundColor: '#f39c12',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  communityButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    backgroundColor: 'white',
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionEmoji: {
    fontSize: 24,
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  streakReminder: {
    backgroundColor: '#fff3cd',
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  streakReminderText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 20,
  },
});
