import { useState } from 'react';
import Editor from './pages/Editor';
import Archive from './pages/Archive';

type Page = 'editor' | 'archive';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('editor');

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-white">
              AI-Редактор журнала v2.0
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentPage('editor')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'editor'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                🤖 Редактор
              </button>
              <button
                onClick={() => setCurrentPage('archive')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'archive'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                📚 Архив
              </button>
            </div>

            <a
              href="https://github.com/m34959203/autoredactor"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      {currentPage === 'editor' && <Editor />}
      {currentPage === 'archive' && <Archive />}
    </div>
  );
}

export default App;
