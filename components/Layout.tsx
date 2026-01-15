
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeProjectName?: string;
  onOpenProjects: () => void;
  onOpenFileManagement: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeProjectName, onOpenProjects, onOpenFileManagement }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto relative overflow-hidden shadow-2xl">
      {/* Header */}
      <header className="dark-green-bg text-white p-6 rounded-b-[40px] shadow-lg sticky top-0 z-50 border-b-4 border-[#D4AF37]">
        <div className="flex justify-between items-center">
          <button 
            onClick={onOpenFileManagement}
            className="p-2 bg-white/10 rounded-2xl hover:bg-white/20 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </button>
          
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight">StockMaster <span className="text-[#D4AF37]">Pro</span></h1>
            <p className="text-[10px] opacity-70 uppercase tracking-widest">{activeProjectName || 'No Project Selected'}</p>
          </div>

          <button 
            onClick={onOpenProjects}
            className="p-2 bg-white/10 rounded-2xl border border-[#D4AF37]/30 hover:bg-white/20 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {children}
      </main>
    </div>
  );
};
