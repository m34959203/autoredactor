import axios from 'axios';
import type { Article, Archive, GenerationStatus, GenerationTask, JournalSettings, PreviewStructure } from '@/types';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Upload endpoints
export const uploadArticle = async (file: File, sessionId?: string): Promise<Article> => {
  const formData = new FormData();
  formData.append('file', file);
  if (sessionId) {
    formData.append('session_id', sessionId);
  }

  const response = await api.post('/upload/article', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const uploadTemplate = async (
  file: File,
  type: 'title' | 'intro' | 'outro',
  sessionId: string
): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('template_type', type);
  formData.append('session_id', sessionId);

  const response = await api.post('/upload/template', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Article endpoints
export const getArticles = async (sessionId: string): Promise<Article[]> => {
  const response = await api.get('/articles/', { params: { session_id: sessionId } });
  return response.data;
};

export const updateArticle = async (
  articleId: string,
  data: { title?: string; author?: string }
): Promise<Article> => {
  const response = await api.patch(`/articles/${articleId}`, data);
  return response.data;
};

export const deleteArticle = async (articleId: string): Promise<void> => {
  await api.delete(`/articles/${articleId}`);
};

export const sortArticles = async (sessionId: string): Promise<any> => {
  const response = await api.post('/articles/sort', null, {
    params: { session_id: sessionId },
  });
  return response.data;
};

export const previewArticle = async (articleId: string): Promise<any> => {
  const response = await api.get(`/articles/${articleId}/preview`);
  return response.data;
};

// Generation endpoints
export const startGeneration = async (
  settings: JournalSettings,
  articleIds: string[],
  templates: { title_id?: string; intro_id?: string; outro_id?: string }
): Promise<GenerationTask> => {
  const response = await api.post('/generate/', {
    settings,
    article_ids: articleIds,
    templates,
  });
  return response.data;
};

export const getGenerationStatus = async (taskId: string): Promise<GenerationStatus> => {
  const response = await api.get(`/generate/${taskId}/status`);
  return response.data;
};

export const downloadJournal = (taskId: string): string => {
  return `${API_BASE}/generate/${taskId}/download`;
};

export const previewStructure = async (
  settings: JournalSettings,
  articleIds: string[],
  templates: { title_id?: string; intro_id?: string; outro_id?: string }
): Promise<PreviewStructure> => {
  const response = await api.post('/generate/preview', {
    settings,
    article_ids: articleIds,
    templates,
  });
  return response.data;
};

// Archive endpoints
export const getArchiveList = async (year?: number, month?: number): Promise<Archive[]> => {
  const response = await api.get('/archive/', { params: { year, month } });
  return response.data;
};

export const getArchiveYears = async (): Promise<number[]> => {
  const response = await api.get('/archive/years');
  return response.data;
};

export const saveToArchive = async (
  taskId: string,
  year: number,
  month: number
): Promise<Archive> => {
  const response = await api.post('/archive/', null, {
    params: { task_id: taskId, year, month },
  });
  return response.data;
};

export const viewArchive = (archiveId: string): string => {
  return `${API_BASE}/archive/${archiveId}/view`;
};

export const downloadArchive = (archiveId: string): string => {
  return `${API_BASE}/archive/${archiveId}/download`;
};
