import type { Article, Template, GenerationTask, ArchiveEntry, GenerationSettings } from '../types';

const API_BASE = '/api';

// Upload API
export const uploadArticle = async (file: File, sessionId?: string): Promise<Article> => {
  const formData = new FormData();
  formData.append('file', file);
  if (sessionId) {
    formData.append('session_id', sessionId);
  }

  const response = await fetch(`${API_BASE}/upload/article`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Upload failed');
  }

  return response.json();
};

export const uploadTemplate = async (
  file: File,
  type: 'title' | 'intro' | 'outro',
  sessionId: string
): Promise<Template> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('template_type', type);
  formData.append('session_id', sessionId);

  const response = await fetch(`${API_BASE}/upload/template`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Upload failed');
  }

  return response.json();
};

// Articles API
export const getArticles = async (sessionId: string): Promise<Article[]> => {
  const response = await fetch(`${API_BASE}/articles?session_id=${sessionId}`);
  if (!response.ok) throw new Error('Failed to fetch articles');
  return response.json();
};

export const updateArticle = async (
  articleId: string,
  data: { title?: string; author?: string }
): Promise<Article> => {
  const response = await fetch(`${API_BASE}/articles/${articleId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to update article');
  return response.json();
};

export const deleteArticle = async (articleId: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/articles/${articleId}`, {
    method: 'DELETE',
  });

  if (!response.ok) throw new Error('Failed to delete article');
};

export const sortArticles = async (sessionId: string): Promise<Article[]> => {
  const response = await fetch(`${API_BASE}/articles/sort`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId }),
  });

  if (!response.ok) throw new Error('Failed to sort articles');
  return response.json();
};

// Generation API
export const startGeneration = async (
  articleIds: string[],
  settings: GenerationSettings,
  templates: { title_id?: string; intro_id?: string; outro_id?: string }
): Promise<GenerationTask> => {
  const response = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      article_ids: articleIds,
      settings,
      templates,
    }),
  });

  if (!response.ok) throw new Error('Failed to start generation');
  return response.json();
};

export const getGenerationStatus = async (taskId: string): Promise<GenerationTask> => {
  const response = await fetch(`${API_BASE}/generate/${taskId}/status`);
  if (!response.ok) throw new Error('Failed to get status');
  return response.json();
};

export const downloadGeneratedPDF = (taskId: string): string => {
  return `${API_BASE}/generate/${taskId}/download`;
};

// Archive API
export const getArchiveList = async (year?: number, month?: number): Promise<ArchiveEntry[]> => {
  let url = `${API_BASE}/archive`;
  const params = new URLSearchParams();
  if (year) params.append('year', year.toString());
  if (month) params.append('month', month.toString());
  if (params.toString()) url += `?${params.toString()}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch archive');
  return response.json();
};

export const getArchiveYears = async (): Promise<number[]> => {
  const response = await fetch(`${API_BASE}/archive/years`);
  if (!response.ok) throw new Error('Failed to fetch years');
  return response.json();
};

export const viewArchivePDF = (archiveId: string): string => {
  return `${API_BASE}/archive/${archiveId}/view`;
};

export const downloadArchivePDF = (archiveId: string): string => {
  return `${API_BASE}/archive/${archiveId}/download`;
};

export const saveToArchive = async (
  taskId: string,
  year: number,
  month: number
): Promise<ArchiveEntry> => {
  const response = await fetch(`${API_BASE}/archive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_id: taskId, year, month }),
  });

  if (!response.ok) throw new Error('Failed to save to archive');
  return response.json();
};
