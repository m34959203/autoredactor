import React from "react";

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "gradient";
  size?: "default" | "lg";
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "default", className = "", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      default: "bg-white text-black hover:bg-gray-100",
      secondary: "bg-gray-800 text-white hover:bg-gray-700",
      gradient: "bg-gradient-to-b from-white via-white/95 to-white/60 text-black hover:scale-105 active:scale-95"
    };

    const sizes = {
      default: "h-10 px-4 py-2 text-sm",
      lg: "h-12 px-8 text-base"
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

// Icons
const FileText = ({ className = "", size = 24 }: { className?: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const Upload = ({ className = "", size = 24 }: { className?: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const CheckCircle = ({ className = "", size = 24 }: { className?: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const Menu = ({ className = "", size = 24 }: { className?: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="4" x2="20" y1="12" y2="12"/>
    <line x1="4" x2="20" y1="6" y2="6"/>
    <line x1="4" x2="20" y1="18" y2="18"/>
  </svg>
);

const X = ({ className = "", size = 24 }: { className?: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18"/>
    <path d="m6 6 12 12"/>
  </svg>
);

// Navigation Component
const Navigation = React.memo(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="fixed top-0 w-full z-50 border-b border-gray-800/50 bg-black/80 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold text-white">Авторедактор Журнала</div>

          <div className="hidden md:flex items-center justify-center gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">
              Возможности
            </a>
            <a href="#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors">
              Как работает
            </a>
            <a href="#github" className="text-sm text-white/60 hover:text-white transition-colors">
              GitHub
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <a href="https://github.com/m34959203/autoredactor" target="_blank" rel="noopener noreferrer">
              <Button type="button" variant="default" size="default">
                GitHub
              </Button>
            </a>
          </div>

          <button
            type="button"
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-gray-800/50">
          <div className="px-6 py-4 flex flex-col gap-4">
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
              Возможности
            </a>
            <a href="#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
              Как работает
            </a>
            <a href="#github" className="text-sm text-white/60 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
              GitHub
            </a>
          </div>
        </div>
      )}
    </header>
  );
});

Navigation.displayName = "Navigation";

// Hero Component
const Hero = React.memo(() => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start px-6 py-20 md:py-24">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        * {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>

      <h1
        className="text-4xl md:text-5xl lg:text-6xl font-medium text-center max-w-3xl px-6 leading-tight mb-6 mt-20"
        style={{
          background: "linear-gradient(to bottom, #ffffff, #ffffff, rgba(255, 255, 255, 0.6))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          letterSpacing: "-0.05em"
        }}
      >
        Авторедактор Журнала
      </h1>

      <p className="text-sm md:text-base text-center max-w-2xl px-6 mb-10" style={{ color: '#9ca3af' }}>
        Автоматизация рутинной работы редактора журнала: сортировка статей, сборка в PDF, формирование содержания
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 mb-16">
        <a href="https://github.com/m34959203/autoredactor" target="_blank" rel="noopener noreferrer">
          <Button type="button" variant="gradient" size="lg" className="rounded-lg">
            Скачать на GitHub
          </Button>
        </a>
        <a href="#features">
          <Button type="button" variant="secondary" size="lg" className="rounded-lg">
            Узнать больше
          </Button>
        </a>
      </div>
    </section>
  );
});

Hero.displayName = "Hero";

// Features Section
const Features = React.memo(() => {
  const features = [
    {
      icon: FileText,
      title: "Сортировка статей",
      description: "Автоматическая сортировка по алфавиту: сначала латиница, затем кириллица"
    },
    {
      icon: Upload,
      title: "Конвертация в PDF",
      description: "Преобразование статей из Word (.docx) в PDF с нумерацией страниц"
    },
    {
      icon: CheckCircle,
      title: "Формирование содержания",
      description: "Автоматическое создание оглавления с указанием страниц"
    }
  ];

  return (
    <section id="features" className="py-20 px-6 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16"
          style={{
            background: "linear-gradient(to bottom, #ffffff, rgba(255, 255, 255, 0.7))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}
        >
          Возможности
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-6 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 backdrop-blur-sm hover:border-purple-500/50 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                <feature.icon size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

Features.displayName = "Features";

// How It Works Section
const HowItWorks = React.memo(() => {
  return (
    <section id="how-it-works" className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16"
          style={{
            background: "linear-gradient(to bottom, #ffffff, rgba(255, 255, 255, 0.7))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}
        >
          Как использовать
        </h2>

        <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">1. Установка</h3>
              <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">
                <code>pip install -r requirements.txt</code>
              </pre>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-2">2. Подготовка статей</h3>
              <p className="text-gray-400 text-sm mb-2">Поместите файлы .docx в папку articles/</p>
              <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                <li>Первый абзац = название статьи</li>
                <li>Автоматическая сортировка по алфавиту</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-2">3. Запуск</h3>
              <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">
                <code>python autoeditor.py ./articles ./output</code>
              </pre>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-2">4. Результат</h3>
              <p className="text-gray-400 text-sm">Готовый журнал в формате PDF с:</p>
              <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                <li>Отсортированными статьями</li>
                <li>Нумерацией страниц</li>
                <li>Автоматическим содержанием</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

HowItWorks.displayName = "HowItWorks";

// Main Component
export default function Component() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navigation />
      <Hero />
      <Features />
      <HowItWorks />
    </main>
  );
}
