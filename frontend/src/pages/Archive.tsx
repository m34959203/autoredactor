import { useState, useEffect } from 'react';
import type { ArchiveEntry } from '../types';
import { getArchiveList, getArchiveYears, viewArchivePDF, downloadArchivePDF } from '../api/client';

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

export default function Archive() {
  const [archives, setArchives] = useState<ArchiveEntry[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadYears();
  }, []);

  useEffect(() => {
    if (selectedYear !== null) {
      loadArchives(selectedYear);
    } else {
      loadArchives();
    }
  }, [selectedYear]);

  const loadYears = async () => {
    try {
      const yearsList = await getArchiveYears();
      setYears(yearsList);
      if (yearsList.length > 0) {
        setSelectedYear(yearsList[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load years');
    }
  };

  const loadArchives = async (year?: number) => {
    setLoading(true);
    setError(null);
    try {
      const list = await getArchiveList(year);
      setArchives(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load archives');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            📚 Архив выпусков
          </h1>
          <p className="text-gray-400">
            История опубликованных журналов
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar: Years */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>📅</span> Годы
              </h2>

              {years.length === 0 ? (
                <p className="text-gray-400 text-sm">Нет архивов</p>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedYear(null)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedYear === null
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    Все годы
                  </button>
                  {years.map((year) => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        selectedYear === year
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content: Archive List */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-6">
                📖 {selectedYear ? `Выпуски ${selectedYear}` : 'Все выпуски'}
              </h2>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                  <p className="mt-4 text-gray-400">Загрузка...</p>
                </div>
              ) : error ? (
                <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
                  <p className="text-red-400 flex items-center gap-2">
                    <span>⚠️</span>
                    {error}
                  </p>
                </div>
              ) : archives.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-6xl mb-4">📭</div>
                  <p>Архив пуст</p>
                  <p className="text-sm mt-2">Опубликованные журналы появятся здесь</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {archives.map((archive) => (
                    <div
                      key={archive.id}
                      className="bg-gray-900/50 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl">📕</span>
                            <div>
                              <h3 className="text-xl font-semibold">
                                {MONTH_NAMES[archive.month - 1]} {archive.year}
                              </h3>
                              <p className="text-sm text-gray-400">
                                Опубликовано: {formatDate(archive.created_at)}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-6 text-sm text-gray-400 mt-3">
                            <span>📄 {archive.pages} страниц</span>
                            <span>📝 {archive.articles_count} статей</span>
                            <span>💾 {formatFileSize(archive.file_size)}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <a
                            href={viewArchivePDF(archive.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors text-sm flex items-center gap-2"
                          >
                            👁️ Просмотр
                          </a>
                          <a
                            href={downloadArchivePDF(archive.id)}
                            download
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors text-sm flex items-center gap-2"
                          >
                            ⬇️ Скачать
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
