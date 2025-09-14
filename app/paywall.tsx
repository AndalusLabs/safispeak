import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';

export default function PaywallScreen() {
  const handleSubscribe = (plan: string) => {
    // Hier zou je de betaling verwerken
    Alert.alert(
      "Abonnement Activeren",
      `Je hebt gekozen voor het ${plan} abonnement. Betaling wordt verwerkt...`,
      [
        {
          text: "OK",
          onPress: () => {
            // Na succesvolle betaling naar de hoofdpagina
            router.push('/(tabs)');
          }
        }
      ]
    );
  };

  const handleRestore = () => {
    Alert.alert("Herstellen", "Je abonnement wordt hersteld...");
  };

  const handleClose = () => {
    Alert.alert(
      "App Verlaten?",
      "Je kunt alleen de eerste les gebruiken zonder abonnement. Wil je de app verlaten?",
      [
        {
          text: "Blijf",
          style: "cancel"
        },
        {
          text: "Verlaat",
          onPress: () => {
            // Hier zou je de app kunnen sluiten
            router.back();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>🚀</Text>
          <Text style={styles.heroTitle}>Unlock Je Darija Potentieel!</Text>
          <Text style={styles.heroSubtitle}>
            Je hebt de smaak te pakken! Ga door met leren en word vloeiend in Darija.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Wat krijg je met Premium?</Text>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>📚</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Onbeperkte Lessen</Text>
              <Text style={styles.featureDescription}>Toegang tot alle 100+ lessen en oefeningen</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>🔥</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Streak Tracking</Text>
              <Text style={styles.featureDescription}>Bouw je dagelijkse gewoonte op en blijf gemotiveerd</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>🏆</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Leaderboards</Text>
              <Text style={styles.featureDescription}>Competieer met vrienden en andere leerlingen</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>🎯</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Persoonlijke Progressie</Text>
              <Text style={styles.featureDescription}>AI-gestuurde lessen op jouw niveau</Text>
            </View>
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.pricingSection}>
          <Text style={styles.pricingTitle}>Kies Je Plan</Text>
          
          {/* Monthly Plan */}
          <TouchableOpacity 
            style={styles.planButton} 
            onPress={() => handleSubscribe('Maandelijks')}
          >
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Maandelijks</Text>
              <Text style={styles.planPrice}>€9,99</Text>
            </View>
            <Text style={styles.planPeriod}>per maand</Text>
          </TouchableOpacity>

          {/* Yearly Plan - Best Value */}
          <TouchableOpacity 
            style={[styles.planButton, styles.bestValueButton]} 
            onPress={() => handleSubscribe('Jaarlijks')}
          >
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText}>BESTE WAARDE</Text>
            </View>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Jaarlijks</Text>
              <Text style={styles.planPrice}>€59,99</Text>
            </View>
            <Text style={styles.planPeriod}>per jaar (€5,00/maand)</Text>
            <Text style={styles.savingsText}>Je bespaart €60 per jaar!</Text>
          </TouchableOpacity>
        </View>

        {/* Trust Signals */}
        <View style={styles.trustSection}>
          <Text style={styles.trustText}>✓ 30 dagen niet-goed-geld-terug garantie</Text>
          <Text style={styles.trustText}>✓ Annuleer op elk moment</Text>
          <Text style={styles.trustText}>✓ Veilige betaling via App Store/Google Play</Text>
        </View>

        {/* Restore Button */}
        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
          <Text style={styles.restoreButtonText}>Herstel Aankopen</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#b0bec5',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 25,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 12,
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: '#b0bec5',
    lineHeight: 20,
  },
  pricingSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  pricingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 25,
  },
  planButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bestValueButton: {
    borderColor: '#64b5f6',
    backgroundColor: 'rgba(100, 181, 246, 0.1)',
  },
  bestValueBadge: {
    backgroundColor: '#64b5f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  bestValueText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#64b5f6',
  },
  planPeriod: {
    fontSize: 14,
    color: '#b0bec5',
    marginBottom: 5,
  },
  savingsText: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: '600',
  },
  trustSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  trustText: {
    fontSize: 14,
    color: '#b0bec5',
    marginBottom: 8,
  },
  restoreButton: {
    alignSelf: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
  },
  restoreButtonText: {
    color: '#64b5f6',
    fontSize: 16,
    fontWeight: '600',
  },
});
