export interface Article {
  id: string;
  session_id: string;
  filename: string;
  title: string | null;
  author: string | null;
  language: string | null;
  sort_order: number | null;
  created_at: string;
  ai_confidence: number | null;
}

export interface Template {
  id: string;
  type: 'title' | 'intro' | 'outro';
  filename: string;
  pages: number;
}

export interface JournalSettings {
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
  task_id: string;
}

export interface GenerationStatus {
  status: 'pending' | 'processing' | 'done' | 'error';
  progress: number;
  current_step: string | null;
  error_message: string | null;
}

export interface Archive {
  id: string;
  year: number;
  month: number;
  filename: string;
  file_url: string;
  pages: number;
  articles_count: number;
  file_size: number;
  created_at: string;
}

export interface PreviewStructure {
  structure: PreviewItem[];
  total_pages: number;
}

export interface PreviewItem {
  type: 'title' | 'intro' | 'article' | 'toc' | 'outro';
  title?: string;
  author?: string;
  page_start?: number;
  pages?: number;
}
