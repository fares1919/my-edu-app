export interface CsvQuestionRow {
  المستوى: string;
  المادة: string;
  السؤال: string;
  اختيار1: string;
  اختيار2: string;
  اختيار3: string;
  اختيار4: string;
  الإجابة: string;
  شرح?: string;
  صورة?: string;
  المدة?: string;
}

export interface CsvValidationError {
  rowIndex: number; // 1-indexed, incluant l'en-tête
  column?: string;
  message: string; // message en arabe
}

export interface CsvPreviewRow {
  rowIndex: number;
  values: Record<string, string>;
  isValid: boolean;
  errors: CsvValidationError[];
}

export interface CsvImportResult {
  rows: CsvQuestionRow[];
  preview: CsvPreviewRow[];
  errors: CsvValidationError[];
}
