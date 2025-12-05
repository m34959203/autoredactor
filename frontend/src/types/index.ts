export interface Article {
  id: string;
  session_id: string;
  filename: string;
  title: string | null;
  author: string | null;
  language: string | null;  // 'latin' | 'cyrillic'
  sort_order: number | null;
  ai_confidence: number | null;
  created_at: string;
}

export interface Template {
  id: string;
  type: 'title' | 'intro' | 'outro';
  filename: string;
  pages: number | null;
}

export interface GenerationSettings {
  indent_lines: number;
  page_format: string;
  margins: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  year: number;
  month: number;
}

export interface GenerationTask {
  id: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  progress: number;
  current_step: string | null;
  error_message: string | null;
}

export interface ArchiveEntry {
  id: string;
  year: number;
  month: number;
  filename: string;
  pages: number;
  articles_count: number;
  file_size: number;
  created_at: string;
}
