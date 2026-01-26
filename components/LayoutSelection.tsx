import React from 'react';
import { LayoutType, LAYOUT_CONFIG } from '../types';
import { Camera, Columns, Lock } from 'lucide-react';

interface Props {
  onSelect: (layout: LayoutType) => void;
  onAdmin: () => void;
}

const LayoutSelection: React.FC<Props> = ({ onSelect, onAdmin }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] text-slate-200 p-4 md:p-6 relative z-10 classic-gradient overflow-y-auto">
      {/* Decorative Border Frame */}
      <div className="absolute inset-2 md:inset-4 border border-amber-200/20 pointer-events-none rounded-2xl md:rounded-3xl" />
      <div className="absolute inset-4 md:inset-6 border border-amber-200/10 pointer-events-none rounded-xl md:rounded-2xl" />

      <div className="text-center mt-8 mb-8 md:mb-16 animate-fade-in-up z-20 shrink-0">
        <h3 className="text-amber-200/60 uppercase tracking-[0.3em] text-xs md:text-sm mb-2 md:mb-4">Est. 2026</h3>
        <h1 className="text-4xl md:text-7xl font-serif font-medium mb-4 md:mb-6 text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-400 drop-shadow-sm leading-tight">
          Deep Blue
        </h1>
        <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-amber-200/50 to-transparent mx-auto mb-4 md:mb-6"></div>
        <p className="text-base md:text-xl text-slate-400 font-light italic max-w-md mx-auto font-serif px-4">
          "A timeless underwater studio experience."
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 w-full max-w-5xl px-2 md:px-4 z-20 pb-10">
        {/* Postcard Option */}
        <button
          onClick={() => onSelect('postcard')}
          className="group relative bg-slate-900/50 backdrop-blur-sm border border-amber-200/10 rounded-xl p-1 transition-all duration-500 hover:-translate-y-2 hover:border-amber-200/40 hover:shadow-[0_0_40px_rgba(251,191,36,0.1)] text-left flex flex-col h-full active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
          
          {/* Inner Content */}
          <div className="bg-slate-950 border border-white/5 rounded-lg p-6 md:p-8 h-full flex flex-col items-center text-center">
            <div className="mb-4 md:mb-6 text-amber-200/80 group-hover:text-amber-100 transition-colors transform group-hover:scale-110 duration-500">
              <Camera size={32} strokeWidth={1} className="md:w-12 md:h-12" />
            </div>
            <h2 className="text-2xl md:text-3xl font-serif text-amber-100 mb-2 md:mb-3">{LAYOUT_CONFIG.postcard.name}</h2>
            <p className="text-slate-400 mb-6 md:mb-8 font-light leading-relaxed text-sm md:text-base">{LAYOUT_CONFIG.postcard.description}</p>
            
            {/* Visual Preview Abstract */}
            <div className="w-24 md:w-32 aspect-[2/3] border border-amber-200/20 p-2 flex flex-col gap-2 opacity-60 group-hover:opacity-100 transition-all">
               <div className="flex-1 bg-amber-200/10"></div>
               <div className="flex-1 bg-amber-200/10"></div>
               <div className="flex-1 bg-amber-200/10"></div>
            </div>
          </div>
        </button>

        {/* Strips Option */}
        <button
          onClick={() => onSelect('strips')}
          className="group relative bg-slate-900/50 backdrop-blur-sm border border-amber-200/10 rounded-xl p-1 transition-all duration-500 hover:-translate-y-2 hover:border-amber-200/40 hover:shadow-[0_0_40px_rgba(251,191,36,0.1)] text-left flex flex-col h-full active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
          
           {/* Inner Content */}
           <div className="bg-slate-950 border border-white/5 rounded-lg p-6 md:p-8 h-full flex flex-col items-center text-center">
            <div className="mb-4 md:mb-6 text-amber-200/80 group-hover:text-amber-100 transition-colors transform group-hover:scale-110 duration-500">
              <Columns size={32} strokeWidth={1} className="md:w-12 md:h-12" />
            </div>
            <h2 className="text-2xl md:text-3xl font-serif text-amber-100 mb-2 md:mb-3">{LAYOUT_CONFIG.strips.name}</h2>
            <p className="text-slate-400 mb-6 md:mb-8 font-light leading-relaxed text-sm md:text-base">{LAYOUT_CONFIG.strips.description}</p>

             {/* Visual Preview Abstract */}
             <div className="w-24 md:w-32 aspect-[2/3] flex gap-2 justify-center opacity-60 group-hover:opacity-100 transition-all">
                <div className="w-1/2 border-x border-amber-200/20 h-full p-1 flex flex-col gap-1">
                  <div className="flex-1 bg-amber-200/10"></div>
                  <div className="flex-1 bg-amber-200/10"></div>
                  <div className="flex-1 bg-amber-200/10"></div>
                  <div className="flex-1 bg-amber-200/10"></div>
                </div>
                <div className="w-1/2 border-x border-amber-200/20 h-full p-1 flex flex-col gap-1">
                  <div className="flex-1 bg-amber-200/10"></div>
                  <div className="flex-1 bg-amber-200/10"></div>
                  <div className="flex-1 bg-amber-200/10"></div>
                  <div className="flex-1 bg-amber-200/10"></div>
                </div>
             </div>
          </div>
        </button>
      </div>

      {/* Admin Button */}
      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 opacity-30 hover:opacity-100 transition-opacity z-50">
        <button onClick={onAdmin} className="text-slate-500 hover:text-amber-200 p-2">
            <Lock size={16} />
        </button>
      </div>
    </div>
  );
};

export default LayoutSelection;