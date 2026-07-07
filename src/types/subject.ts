export type Level =
  | '1_ابتدائي'
  | '2_ابتدائي'
  | '3_ابتدائي'
  | '4_ابتدائي'
  | '5_ابتدائي'
  | '1_متوسط'
  | '2_متوسط'
  | '3_متوسط'
  | '4_متوسط';

export type Subject =
  | 'الرياضيات'
  | 'اللغة العربية'
  | 'اللغة الفرنسية'
  | 'اللغة الإنجليزية'
  | 'التربية الإسلامية'
  | 'التربية المدنية'
  | 'التاريخ والجغرافيا'
  | 'العلوم الطبيعية'
  | 'العلوم الفيزيائية';

export type Cycle = 'primaire' | 'moyen';

export type QuizStatus = 'draft' | 'active' | 'archived';

export type QuestionDuration = number; // seconds, strictly positive

export type Medal = 'gold' | 'silver' | 'bronze' | 'none';
