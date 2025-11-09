import React from 'react';
import { useLocalSearchParams } from 'expo-router';
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
    // Navigation logic would go here
    console.log('Navigate back');
  };

  return (
    <LessonScreen
      lesson={lesson}
      onBack={handleBack}
    />
  );
}