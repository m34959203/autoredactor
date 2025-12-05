import { create } from 'zustand';
import type { Article, JournalSettings, Template } from '@/types';

interface EditorStore {
  // Session
  sessionId: string | null;
  setSessionId: (id: string) => void;

  // Articles
  articles: Article[];
  setArticles: (articles: Article[]) => void;
  addArticle: (article: Article) => void;
  updateArticle: (id: string, data: Partial<Article>) => void;
  removeArticle: (id: string) => void;

  // Templates
  templates: {
    title?: Template;
    intro?: Template;
    outro?: Template;
  };
  setTemplate: (type: 'title' | 'intro' | 'outro', template: Template | undefined) => void;

  // Settings
  settings: JournalSettings;
  updateSettings: (settings: Partial<JournalSettings>) => void;

  // Generation
  isGenerating: boolean;
  generationProgress: number;
  generationStep: string;
  setGenerating: (generating: boolean) => void;
  setGenerationProgress: (progress: number, step: string) => void;
}

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

export const useEditorStore = create<EditorStore>((set) => ({
  // Session
  sessionId: null,
  setSessionId: (id) => set({ sessionId: id }),

  // Articles
  articles: [],
  setArticles: (articles) => set({ articles }),
  addArticle: (article) =>
    set((state) => ({
      articles: [...state.articles, article],
      sessionId: state.sessionId || article.session_id,
    })),
  updateArticle: (id, data) =>
    set((state) => ({
      articles: state.articles.map((a) => (a.id === id ? { ...a, ...data } : a)),
    })),
  removeArticle: (id) =>
    set((state) => ({
      articles: state.articles.filter((a) => a.id !== id),
    })),

  // Templates
  templates: {},
  setTemplate: (type, template) =>
    set((state) => ({
      templates: { ...state.templates, [type]: template },
    })),

  // Settings
  settings: {
    indent_lines: 4,
    page_format: 'A4',
    margins: { left: 2, right: 2, top: 2, bottom: 2 },
    year: currentYear,
    month: currentMonth,
  },
  updateSettings: (settings) =>
    set((state) => ({
      settings: { ...state.settings, ...settings },
    })),

  // Generation
  isGenerating: false,
  generationProgress: 0,
  generationStep: '',
  setGenerating: (generating) => set({ isGenerating: generating }),
  setGenerationProgress: (progress, step) =>
    set({ generationProgress: progress, generationStep: step }),
}));
