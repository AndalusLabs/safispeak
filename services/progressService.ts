import supabase from './authService';

export interface UserProgress {
  id: string;
  user_id: string;
  chapter_id: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export class ProgressService {
  // Get progress for a specific chapter
  static async getChapterProgress(userId: string, chapterId: number): Promise<UserProgress | null> {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('chapter_id', chapterId)
        .single();

      if (error) {
        // If no record exists, return null (not an error)
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Get chapter progress error:', error);
      return null;
    }
  }

  // Check if a chapter is completed
  static async isChapterCompleted(userId: string, chapterId: number): Promise<boolean> {
    try {
      const progress = await this.getChapterProgress(userId, chapterId);
      return progress?.completed === true;
    } catch (error) {
      console.error('Check chapter completed error:', error);
      return false;
    }
  }

  // Mark a chapter as completed
  static async markChapterCompleted(userId: string, chapterId: number): Promise<boolean> {
    try {
      const now = new Date().toISOString();

      // Use upsert to either insert or update
      const { data, error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          chapter_id: chapterId,
          completed: true,
          completed_at: now,
          updated_at: now,
        }, {
          onConflict: 'user_id,chapter_id',
        })
        .select()
        .single();

      if (error) throw error;

      return !!data;
    } catch (error) {
      console.error('Mark chapter completed error:', error);
      return false;
    }
  }

  // Get all completed chapters for a user
  static async getCompletedChapters(userId: string): Promise<number[]> {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('chapter_id')
        .eq('user_id', userId)
        .eq('completed', true);

      if (error) throw error;

      return data?.map((item) => item.chapter_id) || [];
    } catch (error) {
      console.error('Get completed chapters error:', error);
      return [];
    }
  }
}

