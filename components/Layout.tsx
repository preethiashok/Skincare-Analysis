import React from 'react';
import { Sparkles } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex flex-col font-sans">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-primary-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary-500 p-2 rounded-xl shadow-lg shadow-primary-200">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-500">
              GlowGuide AI
            </span>
          </div>
          <nav>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">
              Reset Assessment
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-grow container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {children}
      </main>
      <footer className="py-6 text-center text-slate-400 text-sm border-t border-primary-100 bg-white/50">
        <p>© {new Date().getFullYear()} GlowGuide AI. Not medical advice. Consult a doctor for serious conditions.</p>
      </footer>
    </div>
  );
};