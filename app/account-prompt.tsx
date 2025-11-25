import AccountPromptScreen from '../screens/AccountPromptScreen';
import { router } from 'expo-router';

export default function AccountPromptPage() {
  return (
    <AccountPromptScreen
      onCreateAccount={() => router.push('/onboarding-flow')}
      onContinueWithoutAccount={() => router.back()}
    />
  );
}

