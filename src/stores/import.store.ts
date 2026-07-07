import { create } from 'zustand';
import type { CsvImportResult } from '../types/csv';
import type { LoadState } from '../types/common';
import { parseCsvContent } from '../services/csv/parseCsv';
import { validateCsvContent } from '../services/csv/validateCsv';
import { importCsvFile } from '../services/csv/importCsv';

interface ImportState {
  csvContent: string | null;
  fileName: string | null;
  preview: CsvImportResult | null;
  importState: LoadState;
  importResult: { success: boolean; importedCount: number; quizCount: number; errors: string[] } | null;
  setFile: (content: string, fileName: string) => void;
  analyzeFile: () => void;
  executeImport: () => Promise<void>;
  reset: () => void;
}

export const useImportStore = create<ImportState>((set, get) => ({
  csvContent: null,
  fileName: null,
  preview: null,
  importState: 'idle',
  importResult: null,

  setFile: (content, fileName) => {
    set({ csvContent: content, fileName, preview: null, importResult: null, importState: 'idle' });
  },

  analyzeFile: () => {
    const { csvContent } = get();
    if (!csvContent) return;
    
    const parseResult = parseCsvContent(csvContent);
    const validationResult = validateCsvContent(parseResult);
    set({ preview: validationResult, importState: validationResult.errors.length > 0 ? 'error' : 'success' });
  },

  executeImport: async () => {
    const { csvContent, fileName } = get();
    if (!csvContent) return;
    
    set({ importState: 'loading' });
    try {
      const result = await importCsvFile(csvContent, fileName || undefined);
      set({ importResult: result, importState: result.success ? 'success' : 'error' });
    } catch (err) {
      set({ importState: 'error', importResult: { success: false, importedCount: 0, quizCount: 0, errors: [(err as Error).message] } });
    }
  },

  reset: () => set({
    csvContent: null,
    fileName: null,
    preview: null,
    importState: 'idle',
    importResult: null,
  }),
}));
