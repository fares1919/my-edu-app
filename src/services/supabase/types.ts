// ─── Database type definitions for Supabase ───

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          avatar: string | null;
          level: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          avatar?: string | null;
          level: string;
          created_at: string;
          updated_at: string;
        };
        Update: {
          id?: string;
          name?: string;
          avatar?: string | null;
          level?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          profile_id: string;
          quiz_id: string;
          level: string;
          subject: string;
          started_at: string;
          finished_at: string | null;
          total_questions: number;
          correct_count: number;
          wrong_count: number;
          score: number;
          total_duration: number;
          avg_time_per_question: number;
        };
        Insert: {
          id: string;
          profile_id: string;
          quiz_id: string;
          level: string;
          subject: string;
          started_at: string;
          finished_at?: string | null;
          total_questions: number;
          correct_count: number;
          wrong_count: number;
          score: number;
          total_duration: number;
          avg_time_per_question: number;
        };
        Update: {
          id?: string;
          profile_id?: string;
          quiz_id?: string;
          level?: string;
          subject?: string;
          started_at?: string;
          finished_at?: string | null;
          total_questions?: number;
          correct_count?: number;
          wrong_count?: number;
          score?: number;
          total_duration?: number;
          avg_time_per_question?: number;
        };
      };
      answers: {
        Row: {
          id: string;
          session_id: string;
          question_id: string;
          selected_answer: string | null;
          is_correct: boolean;
          answered_at: string;
          time_spent: number;
        };
        Insert: {
          id: string;
          session_id: string;
          question_id: string;
          selected_answer?: string | null;
          is_correct: boolean;
          answered_at: string;
          time_spent: number;
        };
        Update: {
          id?: string;
          session_id?: string;
          question_id?: string;
          selected_answer?: string | null;
          is_correct?: boolean;
          answered_at?: string;
          time_spent?: number;
        };
      };
    };
  };
}
