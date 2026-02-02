import React, { useState, useEffect } from 'react';
import { DiagramInfo } from '../types';

interface QuestionReferenceProps {
  diagram: DiagramInfo;
  sourceImages: string[];
}

const QuestionReference: React.FC<QuestionReferenceProps> = ({ diagram, sourceImages }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { sourceImageIndex, boundingBox } = diagram;
  const imageUrl = sourceImages[sourceImageIndex];

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsModalOpen(false);
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  if (!imageUrl) return null;

  const [ymin, xmin, ymax, xmax] = boundingBox;
  const width = Math.max(xmax - xmin, 1);
  const height = Math.max(ymax - ymin, 1);
  const snippetAspectRatio = width / height;

  const posX = (1000 - width) <= 0 ? 0 : (xmin / (1000 - width)) * 100;
  const posY = (1000 - height) <= 0 ? 0 : (ymin / (1000 - height)) * 100;

  return (
    <div className="my-4">
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Source Reference</span>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="text-[10px] text-blue-600 font-bold hover:underline uppercase"
        >
          View Full Paper
        </button>
      </div>

      <div 
        onClick={() => setIsModalOpen(true)}
        className="relative rounded-xl border border-slate-200 bg-slate-50 overflow-hidden group cursor-zoom-in hover:border-blue-400 transition-all shadow-sm"
      >
        <div 
          className="w-full opacity-80 group-hover:opacity-100 transition-opacity"
          style={{
            aspectRatio: snippetAspectRatio,
            backgroundImage: `url(${imageUrl})`,
            backgroundPosition: `${posX}% ${posY}%`,
            backgroundSize: `${100000 / width}% ${100000 / height}%`,
            backgroundRepeat: 'no-repeat',
            maxHeight: '180px'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[8px] font-black text-slate-600 border border-slate-200 uppercase">
          Click to Locate
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-12 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md cursor-pointer" 
            onClick={() => setIsModalOpen(false)}
          />
          
          <div className="relative w-full h-full max-w-5xl flex flex-col pointer-events-none">
            <div className="flex justify-between items-center mb-4 pointer-events-auto">
              <div className="text-white">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Page {sourceImageIndex + 1}</p>
                <h4 className="font-bold text-lg">Original Paper Position</h4>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all border border-white/10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-grow bg-slate-900 rounded-2xl overflow-auto border border-white/5 pointer-events-auto relative scrollbar-hide">
              <div className="relative min-w-full inline-block">
                <img src={imageUrl} className="w-full h-auto block" alt="Original Paper" />
                
                <div className="absolute inset-0 pointer-events-none">
                  <div 
                    className="absolute border-4 border-blue-500 rounded-lg ring-4 ring-blue-500/40"
                    style={{
                      top: `${ymin / 10}%`,
                      left: `${xmin / 10}%`,
                      width: `${(xmax - xmin) / 10}%`,
                      height: `${(ymax - ymin) / 10}%`,
                    }}
                  >
                    <div className="absolute -top-10 left-0 bg-blue-600 text-white px-3 py-1 rounded-t-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                      Current Question Location
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em]">
                Authentic Document Verification • Visual Integrity Preserved
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionReference;