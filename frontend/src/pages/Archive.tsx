import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Download, BookOpen } from 'lucide-react';
import * as api from '@/api/client';
import type { Archive } from '@/types';

export function ArchivePage() {
  const [archives, setArchives] = useState<Archive[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      loadArchives(selectedYear);
    } else {
      loadArchives();
    }
  }, [selectedYear]);

  const loadYears = async () => {
    try {
      const data = await api.getArchiveYears();
      setYears(data);
      if (data.length > 0) {
        setSelectedYear(data[0]);
      }
    } catch (error) {
      console.error('Error loading years:', error);
    }
  };

  const loadArchives = async (year?: number) => {
    setLoading(true);
    try {
      const data = await api.getArchiveList(year);
      setArchives(data);
    } catch (error) {
      console.error('Error loading archives:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthNames = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ];

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">📚 Архив выпусков</h1>
        <p className="text-muted-foreground">Все опубликованные выпуски журнала</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Years */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📅 Годы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={selectedYear === null ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedYear(null)}
              >
                Все годы
              </Button>
              {years.map((year) => (
                <Button
                  key={year}
                  variant={selectedYear === year ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedYear(year)}
                >
                  {year}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main content - Archives */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                📖 Выпуски {selectedYear || 'всех годов'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Загрузка...</p>
                </div>
              ) : archives.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Нет выпусков</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {archives.map((archive) => (
                    <Card key={archive.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">
                            📕 {monthNames[archive.month - 1]} {archive.year}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>{archive.pages} страниц</span>
                            <span>•</span>
                            <span>{archive.articles_count} статей</span>
                            <span>•</span>
                            <span>{formatFileSize(archive.file_size)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Создан: {new Date(archive.created_at).toLocaleDateString('ru-RU')}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(api.viewArchive(archive.id), '_blank')}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Просмотр
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = api.downloadArchive(archive.id);
                              link.download = archive.filename;
                              link.click();
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Скачать
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
