import AsyncStorage from '@react-native-async-storage/async-storage';

const ANONYMOUS_PROFILE_ID_KEY = 'safispeak_anonymous_profile_id';

export async function setAnonymousProfileId(profileId: string) {
  try {
    await AsyncStorage.setItem(ANONYMOUS_PROFILE_ID_KEY, profileId);
  } catch (error) {
    console.warn('Failed to persist anonymous profile id:', error);
  }
}

export async function getAnonymousProfileId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(ANONYMOUS_PROFILE_ID_KEY);
  } catch (error) {
    console.warn('Failed to read anonymous profile id:', error);
    return null;
  }
}

export async function clearAnonymousProfileId() {
  try {
    await AsyncStorage.removeItem(ANONYMOUS_PROFILE_ID_KEY);
  } catch (error) {
    console.warn('Failed to clear anonymous profile id:', error);
  }
}


