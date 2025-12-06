import { useCallback, useState } from 'react';
import { FileUploader } from '@/components/FileUploader/FileUploader';
import { ArticleCard } from '@/components/ArticleCard/ArticleCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEditorStore } from '@/stores/editorStore';
import * as api from '@/api/client';
import { Loader2, Rocket } from 'lucide-react';

export function EditorPage() {
  const {
    sessionId,
    articles,
    addArticle,
    updateArticle,
    removeArticle,
    setArticles,
    settings,
    updateSettings,
    templates,
  } = useEditorStore();

  const [uploading, setUploading] = useState(false);
  const [sorting, setSorting] = useState(false);

  const handleFilesUpload = useCallback(
    async (files: File[]) => {
      setUploading(true);
      try {
        for (const file of files) {
          const article = await api.uploadArticle(file, sessionId || undefined);
          addArticle(article);
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Ошибка загрузки файлов');
      } finally {
        setUploading(false);
      }
    },
    [sessionId, addArticle]
  );

  const handleUpdateArticle = async (id: string, data: { title?: string; author?: string }) => {
    try {
      const updated = await api.updateArticle(id, data);
      updateArticle(id, updated);
    } catch (error) {
      console.error('Update error:', error);
      alert('Ошибка обновления статьи');
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Удалить статью?')) return;
    try {
      await api.deleteArticle(id);
      removeArticle(id);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Ошибка удаления статьи');
    }
  };

  const handleSort = async () => {
    if (!sessionId) return;
    setSorting(true);
    try {
      await api.sortArticles(sessionId);
      const updated = await api.getArticles(sessionId);
      setArticles(updated);
    } catch (error) {
      console.error('Sort error:', error);
      alert('Ошибка сортировки');
    } finally {
      setSorting(false);
    }
  };

  const handleGenerate = async () => {
    if (articles.length === 0) {
      alert('Добавьте хотя бы одну статью');
      return;
    }

    try {
      const result = await api.startGeneration(
        settings,
        articles.map((a) => a.id),
        {
          title_id: templates.title?.id,
          intro_id: templates.intro?.id,
          outro_id: templates.outro?.id,
        }
      );

      // Poll for status
      const taskId = result.task_id;
      const interval = setInterval(async () => {
        const status = await api.getGenerationStatus(taskId);
        console.log('Generation status:', status);

        if (status.status === 'done') {
          clearInterval(interval);
          window.open(api.downloadJournal(taskId), '_blank');
        } else if (status.status === 'error') {
          clearInterval(interval);
          alert(`Ошибка генерации: ${status.error_message}`);
        }
      }, 2000);
    } catch (error) {
      console.error('Generation error:', error);
      alert('Ошибка запуска генерации');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">🤖 AI-Редактор журнала</h1>
        <p className="text-muted-foreground">Автоматизация сборки научного журнала</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Upload & Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📁 Загрузка файлов</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploader
                onFilesAccepted={handleFilesUpload}
                disabled={uploading}
              />
              {uploading && (
                <div className="mt-4 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">Загрузка и обработка...</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">⚙️ Настройки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Отступы перед статьёй</label>
                <input
                  type="number"
                  value={settings.indent_lines}
                  onChange={(e) => updateSettings({ indent_lines: parseInt(e.target.value) })}
                  min={0}
                  max={10}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Год</label>
                  <input
                    type="number"
                    value={settings.year}
                    onChange={(e) => updateSettings({ year: parseInt(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Месяц</label>
                  <input
                    type="number"
                    value={settings.month}
                    onChange={(e) => updateSettings({ month: parseInt(e.target.value) })}
                    min={1}
                    max={12}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right columns - Articles */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">📋 Статьи ({articles.length})</CardTitle>
                <Button onClick={handleSort} disabled={sorting || articles.length === 0} size="sm">
                  {sorting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Сортировать A→Я
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {articles.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Статьи не загружены</p>
                  <p className="text-sm mt-2">Загрузите .docx файлы для начала работы</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {articles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      onUpdate={handleUpdateArticle}
                      onDelete={handleDeleteArticle}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {articles.length > 0 && (
            <div className="mt-6">
              <Button onClick={handleGenerate} size="lg" className="w-full">
                <Rocket className="w-5 h-5 mr-2" />
                Сгенерировать журнал
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
