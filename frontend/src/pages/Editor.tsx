import { useState, useEffect, useRef } from 'react';
import type { Article, Template } from '../types';
import { uploadArticle, uploadTemplate, getArticles, updateArticle, deleteArticle, sortArticles } from '../api/client';

export default function Editor() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [templates, setTemplates] = useState<{ title?: Template; intro?: Template; outro?: Template }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.add('border-blue-500', 'bg-blue-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.remove('border-blue-500', 'bg-blue-50');
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.remove('border-blue-500', 'bg-blue-50');

    const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.docx'));
    await handleFileUpload(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).filter(f => f.name.endsWith('.docx'));
    await handleFileUpload(files);
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      for (const file of files) {
        const article = await uploadArticle(file, sessionId || undefined);
        if (!sessionId) setSessionId(article.session_id);
        setArticles(prev => [...prev, article]);
      }

      // Auto-sort after upload
      if (sessionId || files.length > 0) {
        const sid = sessionId || (await uploadArticle(files[0])).session_id;
        const sorted = await sortArticles(sid);
        setArticles(sorted);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      await deleteArticle(id);
      setArticles(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const startEditing = (article: Article) => {
    setEditingId(article.id);
    setEditTitle(article.title || '');
    setEditAuthor(article.author || '');
  };

  const saveEditing = async (id: string) => {
    try {
      const updated = await updateArticle(id, {
        title: editTitle,
        author: editAuthor,
      });
      setArticles(prev => prev.map(a => (a.id === id ? updated : a)));
      setEditingId(null);

      // Re-sort after editing author
      if (sessionId) {
        const sorted = await sortArticles(sessionId);
        setArticles(sorted);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
    setEditAuthor('');
  };

  const getLanguageColor = (lang: string | null) => {
    if (lang === 'latin') return 'bg-purple-100 text-purple-700';
    if (lang === 'cyrillic') return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            🤖 AI-Редактор журнала
          </h1>
          <p className="text-gray-400">
            Автоматическая сборка журнала с AI-извлечением метаданных
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel: Upload */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>📁</span> Загрузка статей
              </h2>

              {/* Drag & Drop Zone */}
              <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition-all mb-4"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="text-5xl mb-4">📄</div>
                <p className="text-lg mb-2">Перетащите .docx файлы</p>
                <p className="text-sm text-gray-400">или нажмите для выбора</p>
              </div>

              {isUploading && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                  <p className="mt-2 text-sm text-gray-400">AI анализирует статьи...</p>
                </div>
              )}

              <div className="mt-6 space-y-2 text-sm text-gray-400">
                <p>✓ AI извлечет название и автора</p>
                <p>✓ Автоматическая сортировка A→Z, А→Я</p>
                <p>✓ Определение языка статьи</p>
              </div>
            </div>
          </div>

          {/* Right Panel: Articles List */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span>📋</span> Статьи ({articles.length})
                </h2>
                {articles.length > 0 && (
                  <button
                    onClick={() => sessionId && sortArticles(sessionId).then(setArticles)}
                    className="text-sm px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                  >
                    ↕️ Пересортировать
                  </button>
                )}
              </div>

              {articles.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-6xl mb-4">📭</div>
                  <p>Статьи еще не загружены</p>
                  <p className="text-sm mt-2">Загрузите .docx файлы слева</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {articles.map((article, index) => (
                    <div
                      key={article.id}
                      className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-gray-500 text-sm mt-1">#{index + 1}</span>

                        <div className="flex-1">
                          {editingId === article.id ? (
                            // Edit mode
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editAuthor}
                                onChange={(e) => setEditAuthor(e.target.value)}
                                placeholder="Автор"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                              />
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Название статьи"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveEditing(article.id)}
                                  className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded text-sm"
                                >
                                  ✓ Сохранить
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm"
                                >
                                  ✕ Отмена
                                </button>
                              </div>
                            </div>
                          ) : (
                            // View mode
                            <>
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`text-xs px-2 py-1 rounded font-semibold ${getLanguageColor(
                                    article.language
                                  )}`}
                                >
                                  {article.language === 'latin' ? 'LAT' : 'CYR'}
                                </span>
                                <span className="font-semibold">
                                  {article.author || 'Автор не определен'}
                                </span>
                                {article.ai_confidence && article.ai_confidence < 0.7 && (
                                  <span className="text-xs text-yellow-500" title="Низкая точность AI">
                                    ⚠️
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-300 text-sm mb-1">
                                "{article.title || 'Название не определено'}"
                              </p>
                              <p className="text-xs text-gray-500">{article.filename}</p>
                            </>
                          )}
                        </div>

                        {editingId !== article.id && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditing(article)}
                              className="text-blue-400 hover:text-blue-300"
                              title="Редактировать"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteArticle(article.id)}
                              className="text-red-400 hover:text-red-300"
                              title="Удалить"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500 rounded-lg p-4">
            <p className="text-red-400 flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </p>
          </div>
        )}

        {/* Generate Button */}
        {articles.length > 0 && (
          <div className="mt-6">
            <button
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl font-semibold text-lg transition-all shadow-lg"
            >
              🚀 Сгенерировать журнал
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
