
import React from 'react';
import { Project } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm transition-all">
      <div className="bg-white w-full max-w-md rounded-t-[40px] p-8 max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up border-t-4 border-[#D4AF37]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-emerald-900">{title}</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const ProjectCard: React.FC<{ project: Project; onSelect: (id: string) => void }> = ({ project, onSelect }) => {
  const totalInvestment = project.products.reduce((acc, p) => acc + (p.mrp * p.stock), 0);
  const outOfStock = project.products.filter(p => p.stock === 0).length;

  return (
    <div 
      onClick={() => onSelect(project.id)}
      className="bg-white border-2 border-slate-100 rounded-[24px] p-5 mb-4 hover:border-[#D4AF37] transition-all cursor-pointer group custom-shadow"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-emerald-950 group-hover:text-[#D4AF37] transition-colors">{project.name}</h3>
        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold uppercase">Active</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-50 p-3 rounded-2xl text-center">
          <p className="text-[10px] text-slate-500 uppercase font-medium">Inv.</p>
          <p className="text-xs font-bold text-emerald-900">₹{totalInvestment.toLocaleString()}</p>
        </div>
        <div className="bg-slate-50 p-3 rounded-2xl text-center">
          <p className="text-[10px] text-slate-500 uppercase font-medium">Items</p>
          <p className="text-xs font-bold text-emerald-900">{project.products.length}</p>
        </div>
        <div className="bg-slate-50 p-3 rounded-2xl text-center">
          <p className="text-[10px] text-slate-500 uppercase font-medium">Alerts</p>
          <p className="text-xs font-bold text-red-500">{outOfStock}</p>
        </div>
      </div>
    </div>
  );
};
