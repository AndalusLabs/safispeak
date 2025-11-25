import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { ProgressService } from '../services/progressService';
import { getChapterProgressLocal, getCompletedChaptersLocal } from '../services/lessonCompletionService';
import { isPremiumUnlocked } from '../services/premiumService';

type LessonStatus = 'current' | 'locked' | 'available' | 'completed' | 'inProgress';

interface LessonMeta {
  id: number;
  title: string;
  description: string;
}

const LESSONS: LessonMeta[] = [
  {
    id: 1,
    title: 'Introduction',
    description: '',
  },
  {
    id: 2,
    title: 'Greetings',
    description: 'Move beyond hello with real-life greeting scenarios.',
  },
  {
    id: 3,
    title: 'Family',
    description: 'Talk about the people closest to you with confidence.',
    status: 'locked',
  },
  {
    id: 4,
    title: 'Holiday',
    description: 'Plan and describe adventures like a local.',
    status: 'locked',
  },
  {
    id: 5,
    title: 'Food & Drinks',
    description: 'Order, taste, and compliment every Moroccan dish.',
    status: 'locked',
  },
  {
    id: 6,
    title: 'Numbers & Time',
    description: 'Count, schedule, and navigate your day with ease.',
  },
];

const LessonOverviewScreen = () => {
  const insets = useSafeAreaInsets();
  const safeTop = insets.top || 20;
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);
  const [completedChapters, setCompletedChapters] = useState<number[]>([]);
  const [chapterProgress, setChapterProgress] = useState<Record<number, number>>({});
  const { isAuthenticated, user } = useAuth();

  const refreshPremiumState = useCallback(async () => {
    const unlocked = await isPremiumUnlocked();
    setPremiumUnlocked(unlocked);
  }, []);

  const refreshCompletionState = useCallback(async () => {
    const [localCompleted, localProgress] = await Promise.all([
      getCompletedChaptersLocal(),
      getChapterProgressLocal(),
    ]);

    const sanitizeProgress = (progressMap: Record<number, number>, completed: number[]) => {
      const clone: Record<number, number> = { ...progressMap };
      completed.forEach((chapterId) => {
        if (clone[chapterId] !== undefined) {
          delete clone[chapterId];
        }
      });
      return clone;
    };

    if (isAuthenticated && user?.id) {
      const remoteCompleted = await ProgressService.getCompletedChapters(user.id);
      const merged = Array.from(new Set([...localCompleted, ...remoteCompleted]));
      setCompletedChapters(merged);
      setChapterProgress(sanitizeProgress(localProgress, merged));
      return;
    }

    setCompletedChapters(localCompleted);
    setChapterProgress(sanitizeProgress(localProgress, localCompleted));
  }, [isAuthenticated, user?.id]);

  useFocusEffect(
    useCallback(() => {
      refreshPremiumState();
      refreshCompletionState();
    }, [refreshPremiumState, refreshCompletionState])
  );

  const determineStatus = useCallback(
    (lessonId: number): LessonStatus => {
      if (completedChapters.includes(lessonId)) return 'completed';
      const progressRatio = chapterProgress[lessonId];
      if (progressRatio && progressRatio > 0) return 'inProgress';
      if (lessonId === 1) return 'current';
      return premiumUnlocked ? 'available' : 'locked';
    },
    [chapterProgress, completedChapters, premiumUnlocked]
  );

  const handleLessonPress = (lesson: LessonMeta, status: LessonStatus) => {
    if (status === 'locked') {
      Alert.alert(
        'Locked lesson',
        'Unlock more lessons by upgrading inside Introduction after completing the first chapter.'
      );
      return;
    }

    const path =
      lesson.id === 1
        ? '/lessons/1'
        : `/lessons/${lesson.id}?skipAuth=true`;

    router.push(path);
  };

  const heroSubtitle = useMemo(() => {
    if (premiumUnlocked) {
      return 'You unlocked the full learning path. Explore any lesson you like!';
    }

    if (completedChapters.includes(1)) {
      return 'Great progress! Upgrade to unlock the rest of the path.';
    }

    return 'Finish Introduction to unlock your learning path.';
  }, [premiumUnlocked, completedChapters]);

  return (
    <View style={styles.container}>
      <View style={[styles.hero, { paddingTop: safeTop + 10 }]}>
        <View style={styles.heroAccent} />
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} accessibilityRole="button">
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.heroContent}>
          <Text style={styles.heroEyebrow}>Lesson overview</Text>
          <Text style={styles.heroTitle}>Stay curious</Text>
          <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {LESSONS.map((lesson) => {
          const status = determineStatus(lesson.id);
          const progressRatio = chapterProgress[lesson.id] ?? 0;
          return (
          <TouchableOpacity
            key={lesson.id}
            style={[
              styles.card,
              status === 'completed' && styles.cardCompleted,
              status === 'current' && styles.cardCurrent,
              status === 'available' && styles.cardUnlocked,
              status === 'locked' && styles.cardLocked,
              status === 'inProgress' && styles.cardInProgress,
            ]}
            activeOpacity={status === 'locked' ? 1 : 0.85}
            onPress={() => handleLessonPress(lesson, status)}
          >
            <View style={styles.cardLeft}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardIndex}>{lesson.id.toString().padStart(2, '0')}</Text>
                {status === 'completed' ? (
                  <View style={styles.statusPillCompleted}>
                    <Ionicons name="checkmark-circle" size={14} color="#065F46" />
                    <Text style={styles.statusPillTextCompleted}>Completed</Text>
                  </View>
                ) : status === 'inProgress' ? (
                  <View style={styles.statusPillInProgress}>
                    <Ionicons name="time-outline" size={14} color="#475569" />
                    <Text style={styles.statusPillTextInProgress}>In progress</Text>
                  </View>
                ) : status === 'current' ? (
                  <View style={styles.statusPillCurrent}>
                    <Ionicons name="sparkles" size={14} color="#00A86B" />
                    <Text style={styles.statusPillTextCurrent}>Free forever</Text>
                  </View>
                ) : status === 'available' ? (
                  <View style={styles.statusPillUnlocked}>
                    <Ionicons name="flash" size={14} color="#047857" />
                    <Text style={styles.statusPillTextUnlocked}>Unlocked</Text>
                  </View>
                ) : (
                  <View style={styles.statusPillLocked}>
                    <Ionicons name="lock-closed" size={14} color="#FFFFFF" />
                    <Text style={styles.statusPillTextLocked}>Locked</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardTitle}>{lesson.title}</Text>
              {lesson.description ? (
                <Text style={styles.cardDescription}>{lesson.description}</Text>
              ) : null}
            </View>

            <View style={styles.cardRight}>
              {status === 'locked' ? (
                <Ionicons name="lock-closed" size={30} color="#C8CFD5" />
              ) : (
                <Ionicons
                  name="play-circle"
                  size={34}
                  color={
                    status === 'completed'
                      ? '#065F46'
                      : status === 'inProgress'
                        ? '#475569'
                      : status === 'current'
                        ? '#00A86B'
                        : '#047857'
                  }
                />
              )}
            </View>
            {status === 'inProgress' && (
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.min(progressRatio, 1) * 100}%` }]} />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
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
    overflow: 'hidden',
  },
  heroAccent: {
    position: 'absolute',
    top: -140,
    right: -100,
    width: 320,
    height: 320,
    backgroundColor: '#00A86B',
    opacity: 0.15,
    borderRadius: 160,
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#F8FAFB',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  cardCurrent: {
    backgroundColor: '#E6F6EF',
    borderWidth: 2,
    borderColor: '#00A86B',
  },
  cardCompleted: {
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: '#059669',
  },
  cardUnlocked: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  cardLocked: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardInProgress: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5F5',
  },
  cardLeft: {
    flex: 1,
    paddingRight: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  cardIndex: {
    fontSize: 16,
    color: '#8592A3',
    fontFamily: 'Baloo2-Bold',
  },
  statusPillCurrent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    gap: 4,
  },
  statusPillLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    gap: 4,
  },
  statusPillTextCurrent: {
    fontSize: 12,
    fontFamily: 'Baloo2-Bold',
    color: '#00A86B',
  },
  statusPillTextLocked: {
    fontSize: 12,
    fontFamily: 'Baloo2-Bold',
    color: '#FFFFFF',
  },
  statusPillCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    gap: 4,
  },
  statusPillTextCompleted: {
    fontSize: 12,
    fontFamily: 'Baloo2-Bold',
    color: '#065F46',
  },
  statusPillUnlocked: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    gap: 4,
  },
  statusPillTextUnlocked: {
    fontSize: 12,
    fontFamily: 'Baloo2-Bold',
    color: '#047857',
  },
  statusPillInProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    gap: 4,
  },
  statusPillTextInProgress: {
    fontSize: 12,
    fontFamily: 'Baloo2-Bold',
    color: '#475569',
  },
  progressTrack: {
    marginTop: 12,
    width: '100%',
    height: 6,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#64748B',
  },
  cardTitle: {
    fontSize: 22,
    color: '#1F2A37',
    fontFamily: 'Baloo2-Bold',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: '#4B5563',
    fontFamily: 'Baloo2-Medium',
    lineHeight: 20,
  },
  cardRight: {
    width: 40,
    alignItems: 'flex-end',
  },
});

export default LessonOverviewScreen;

