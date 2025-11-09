import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import LessonScreen from '../../screens/LessonScreen';
import lessons from './data';

export default function LessonPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lessonId = id || '1';
  const lesson = lessons[Number(lessonId) as keyof typeof lessons];

  if (!lesson) {
    return null; // or error component
  }

  const handleBack = () => {
    router.back();
  };

  return (
    <LessonScreen
      lesson={lesson}
      onBack={handleBack}
    />
  );
}