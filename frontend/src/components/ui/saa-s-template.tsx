import { useState, useRef } from "react";

interface UploadedFile {
  file: File;
  name: string;
}

export default function JournalEditor() {
  const [articles, setArticles] = useState<UploadedFile[]>([]);
  const [titlePage, setTitlePage] = useState<File | null>(null);
  const [firstPages, setFirstPages] = useState<File | null>(null);
  const [endPages, setEndPages] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");

  const articlesInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);

  const handleArticlesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles: UploadedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.endsWith('.docx')) {
        validFiles.push({ file, name: file.name });
      }
    }

    setArticles(prev => [...prev, ...validFiles]);
    setError(null);
  };

  const removeArticle = (index: number) => {
    setArticles(prev => prev.filter((_, i) => i !== index));
  };

  const handleBuildJournal = async () => {
    if (articles.length === 0) {
      setError("Добавьте хотя бы одну статью (.docx)");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress("Загрузка файлов...");

    try {
      const formData = new FormData();

      // Add articles
      articles.forEach(item => {
        formData.append('articles', item.file);
      });

      // Add optional PDFs
      if (titlePage) formData.append('title_page', titlePage);
      if (firstPages) formData.append('first_pages', firstPages);
      if (endPages) formData.append('end_pages', endPages);

      setProgress("Обработка статей...");

      const response = await fetch('/api/build-journal', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка сервера');
      }

      setProgress("Скачивание журнала...");

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'journal.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setProgress("Готово! Файл скачан.");

      // Reset form after 2 seconds
      setTimeout(() => {
        setArticles([]);
        setTitlePage(null);
        setFirstPages(null);
        setEndPages(null);
        setProgress("");
        if (articlesInputRef.current) articlesInputRef.current.value = '';
        if (titleInputRef.current) titleInputRef.current.value = '';
        if (firstInputRef.current) firstInputRef.current.value = '';
        if (endInputRef.current) endInputRef.current.value = '';
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
      setProgress("");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Авторедактор Журнала
          </h1>
          <p className="text-gray-400">
            Автоматическая сборка журнала из статей Word в PDF
          </p>
        </div>

        {/* Main Upload Area */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">📄</span>
            Статьи (обязательно)
          </h2>

          <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center mb-4 hover:border-blue-500 transition-colors">
            <input
              ref={articlesInputRef}
              type="file"
              accept=".docx"
              multiple
              onChange={handleArticlesUpload}
              className="hidden"
              id="articles-upload"
            />
            <label htmlFor="articles-upload" className="cursor-pointer">
              <div className="text-5xl mb-4">📁</div>
              <p className="text-lg mb-2">Загрузите статьи Word (.docx)</p>
              <p className="text-sm text-gray-400">Нажмите или перетащите файлы</p>
            </label>
          </div>

          {/* Articles List */}
          {articles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-400 mb-2">Загружено статей: {articles.length}</p>
              {articles.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-900/50 rounded-lg px-4 py-3">
                  <span className="text-sm truncate flex-1">{item.name}</span>
                  <button
                    onClick={() => removeArticle(index)}
                    className="ml-4 text-red-400 hover:text-red-300 text-xl"
                    title="Удалить"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Optional PDFs */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 mb-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="text-2xl">📎</span>
            Дополнительные файлы (необязательно)
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Title Page */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Титульная страница</label>
              <input
                ref={titleInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => setTitlePage(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-500 file:text-white
                  hover:file:bg-blue-600
                  file:cursor-pointer cursor-pointer"
              />
              {titlePage && <p className="text-xs text-green-400 mt-1">✓ {titlePage.name}</p>}
            </div>

            {/* First Pages */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Первые страницы</label>
              <input
                ref={firstInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => setFirstPages(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-500 file:text-white
                  hover:file:bg-blue-600
                  file:cursor-pointer cursor-pointer"
              />
              {firstPages && <p className="text-xs text-green-400 mt-1">✓ {firstPages.name}</p>}
            </div>

            {/* End Pages */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Последние страницы</label>
              <input
                ref={endInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => setEndPages(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-500 file:text-white
                  hover:file:bg-blue-600
                  file:cursor-pointer cursor-pointer"
              />
              {endPages && <p className="text-xs text-green-400 mt-1">✓ {endPages.name}</p>}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400 flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              {error}
            </p>
          </div>
        )}

        {/* Progress */}
        {progress && (
          <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4 mb-6">
            <p className="text-blue-400 flex items-center gap-2">
              <span className="text-xl">⏳</span>
              {progress}
            </p>
          </div>
        )}

        {/* Build Button */}
        <button
          onClick={handleBuildJournal}
          disabled={isProcessing || articles.length === 0}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all
            ${isProcessing || articles.length === 0
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
            }`}
        >
          {isProcessing ? '⏳ Обработка...' : '🚀 Собрать журнал'}
        </button>

        {/* Instructions */}
        <div className="mt-8 bg-gray-800/30 rounded-xl p-6 border border-gray-700">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span className="text-xl">ℹ️</span>
            Как это работает:
          </h3>
          <ol className="space-y-2 text-sm text-gray-400">
            <li>1. Загрузите статьи в формате .docx (первый абзац = название)</li>
            <li>2. При необходимости добавьте титульную страницу и дополнительные PDF</li>
            <li>3. Нажмите "Собрать журнал"</li>
            <li>4. Система автоматически отсортирует статьи и создаст PDF с содержанием</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
