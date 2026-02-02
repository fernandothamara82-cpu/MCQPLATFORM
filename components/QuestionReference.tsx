import React, { useState, useEffect, useRef } from 'react';
import { DiagramInfo } from '../types';

interface QuestionReferenceProps {
  diagram: DiagramInfo;
  sourceImages: string[];
  mode?: 'snippet' | 'compact';
}

const QuestionReference: React.FC<QuestionReferenceProps> = ({ diagram, sourceImages, mode = 'snippet' }) => {
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

  if (!imageUrl || !boundingBox) return null;

  const [ymin, xmin, ymax, xmax] = boundingBox;
  const width = Math.max(xmax - xmin, 1);
  const height = Math.max(ymax - ymin, 1);
  const snippetAspectRatio = width / height;

  const posX = (1000 - width) <= 0 ? 0 : (xmin / (1000 - width)) * 100;
  const posY = (1000 - height) <= 0 ? 0 : (ymin / (1000 - height)) * 100;

  if (mode === 'compact') {
    return (
      <div className="my-2">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 text-[10px] text-slate-500 font-bold hover:text-blue-600 transition-colors uppercase bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          <span>View Source in Paper</span>
        </button>
        {isModalOpen && <ModalView imageUrl={imageUrl} ymin={ymin} xmin={xmin} ymax={ymax} xmax={xmax} sourceImageIndex={sourceImageIndex} onClose={() => setIsModalOpen(false)} />}
      </div>
    );
  }

  return (
    <div className="my-6">
      <div className="flex justify-between items-center mb-3 px-1">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Snippet</span>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="text-[10px] text-blue-600 font-bold hover:underline uppercase"
        >
          Full View
        </button>
      </div>

      <div 
        onClick={() => setIsModalOpen(true)}
        className="relative rounded-2xl border border-slate-200 bg-white overflow-hidden group cursor-zoom-in hover:border-blue-400 transition-all shadow-sm"
      >
        <div 
          className="w-full opacity-90 group-hover:opacity-100 transition-opacity"
          style={{
            aspectRatio: snippetAspectRatio,
            backgroundImage: `url(${imageUrl})`,
            backgroundPosition: `${posX}% ${posY}%`,
            backgroundSize: `${100000 / width}% ${100000 / height}%`,
            backgroundRepeat: 'no-repeat',
            maxHeight: '300px'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 to-transparent pointer-events-none" />
      </div>

      {isModalOpen && <ModalView imageUrl={imageUrl} ymin={ymin} xmin={xmin} ymax={ymax} xmax={xmax} sourceImageIndex={sourceImageIndex} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

interface ModalViewProps {
  imageUrl: string;
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
  sourceImageIndex: number;
  onClose: () => void;
}

const ModalView: React.FC<ModalViewProps> = ({ imageUrl, ymin, xmin, ymax, xmax, sourceImageIndex, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-center the highlight box when modal opens
    if (highlightRef.current && containerRef.current) {
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({
          behavior: 'instant',
          block: 'center',
          inline: 'center'
        });
      }, 100);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-12 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md cursor-pointer" onClick={onClose} />
      <div className="relative w-full h-full max-w-5xl flex flex-col pointer-events-none">
        <div className="flex justify-between items-center mb-4 pointer-events-auto">
          <div className="text-white">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Page {sourceImageIndex + 1}</p>
            <h4 className="font-bold text-lg">Source Verification</h4>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all border border-white/10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div 
          ref={containerRef}
          className="flex-grow bg-slate-900 rounded-3xl overflow-auto border border-white/5 pointer-events-auto relative scrollbar-hide"
        >
          <div className="relative min-w-full inline-block">
            <img src={imageUrl} className="w-full h-auto block max-w-none" style={{ minWidth: '100%' }} alt="Full Paper" />
            <div className="absolute inset-0 pointer-events-none">
              <div 
                ref={highlightRef}
                className="absolute border-4 border-blue-500 rounded-lg ring-4 ring-blue-500/30"
                style={{
                  top: `${ymin / 10}%`,
                  left: `${xmin / 10}%`,
                  width: `${(xmax - xmin) / 10}%`,
                  height: `${(ymax - ymin) / 10}%`,
                }}
              >
                <div className="absolute -top-10 left-0 bg-blue-600 text-white px-3 py-1 rounded-t-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                  Selected Question Area
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionReference;