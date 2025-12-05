import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { EditorPage } from './pages/Editor';
import { ArchivePage } from './pages/Archive';
import { Button } from './components/ui/button';
import { FileEdit, Archive } from 'lucide-react';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold">
              🤖 AI-Редактор
            </Link>
            <div className="flex gap-2">
              <Link to="/">
                <Button
                  variant={location.pathname === '/' ? 'default' : 'ghost'}
                  size="sm"
                >
                  <FileEdit className="w-4 h-4 mr-2" />
                  Редактор
                </Button>
              </Link>
              <Link to="/archive">
                <Button
                  variant={location.pathname === '/archive' ? 'default' : 'ghost'}
                  size="sm"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Архив
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Navigation />
        <Routes>
          <Route path="/" element={<EditorPage />} />
          <Route path="/archive" element={<ArchivePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
