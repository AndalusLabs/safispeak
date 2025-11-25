import AsyncStorage from '@react-native-async-storage/async-storage';

const COMPLETED_CHAPTERS_KEY = 'safispeak_completed_chapters';
const IN_PROGRESS_CHAPTERS_KEY = 'safispeak_in_progress_chapters';

async function readChapters(): Promise<number[]> {
  try {
    const stored = await AsyncStorage.getItem(COMPLETED_CHAPTERS_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return parsed.map((value) => Number(value)).filter((value) => !Number.isNaN(value));
    }
    return [];
  } catch (error) {
    console.warn('Failed to read completed chapters:', error);
    return [];
  }
}

export async function getCompletedChaptersLocal(): Promise<number[]> {
  return readChapters();
}

export async function markChapterCompletedLocal(chapterId: number) {
  try {
    const current = await readChapters();
    if (current.includes(chapterId)) {
      return;
    }
    const updated = [...current, chapterId];
    await AsyncStorage.setItem(COMPLETED_CHAPTERS_KEY, JSON.stringify(updated));
    await removeChapterProgressLocal(chapterId);
  } catch (error) {
    console.warn('Failed to persist completed chapters:', error);
  }
}

export async function clearCompletedChaptersLocal() {
  try {
    await AsyncStorage.removeItem(COMPLETED_CHAPTERS_KEY);
  } catch (error) {
    console.warn('Failed to clear completed chapters:', error);
  }
}

export async function setChapterProgressLocal(chapterId: number, progress: number) {
  try {
    const stored = await AsyncStorage.getItem(IN_PROGRESS_CHAPTERS_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    const nextValue = Math.min(Math.max(progress, 0), 1);
    parsed[chapterId] = nextValue;
    await AsyncStorage.setItem(IN_PROGRESS_CHAPTERS_KEY, JSON.stringify(parsed));
  } catch (error) {
    console.warn('Failed to persist chapter progress:', error);
  }
}

export async function getChapterProgressLocal(): Promise<Record<number, number>> {
  try {
    const stored = await AsyncStorage.getItem(IN_PROGRESS_CHAPTERS_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    if (typeof parsed === 'object' && parsed !== null) {
      const result: Record<number, number> = {};
      Object.entries(parsed).forEach(([key, value]) => {
        const numKey = Number(key);
        if (!Number.isNaN(numKey)) {
          const numericValue = Number(value);
          result[numKey] = Number.isNaN(numericValue) ? 0 : Math.min(Math.max(numericValue, 0), 1);
        }
      });
      return result;
    }
    return {};
  } catch (error) {
    console.warn('Failed to read chapter progress:', error);
    return {};
  }
}

export async function clearChapterProgressLocal() {
  try {
    await AsyncStorage.removeItem(IN_PROGRESS_CHAPTERS_KEY);
  } catch (error) {
    console.warn('Failed to clear chapter progress:', error);
  }
}

export async function removeChapterProgressLocal(chapterId: number) {
  try {
    const stored = await AsyncStorage.getItem(IN_PROGRESS_CHAPTERS_KEY);
    if (!stored) return;
    const parsed = JSON.parse(stored);
    if (typeof parsed !== 'object' || parsed === null) return;
    if (!(chapterId in parsed)) return;
    delete parsed[chapterId];
    await AsyncStorage.setItem(IN_PROGRESS_CHAPTERS_KEY, JSON.stringify(parsed));
  } catch (error) {
    console.warn('Failed to remove chapter progress:', error);
  }
}

