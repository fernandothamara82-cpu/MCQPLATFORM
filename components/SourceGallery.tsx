import React, { useState, useEffect, useRef } from 'react';

interface SourceGalleryProps {
  paperImages: string[];
  markingImages: string[];
  highlight?: {
    sourceImageIndex: number;
    boundingBox: [number, number, number, number];
  };
  onClose: () => void;
}

const SourceGallery: React.FC<SourceGalleryProps> = ({ paperImages, markingImages, highlight, onClose }) => {
  const [activeTab, setActiveTab] = useState<'paper' | 'marking'>('paper');
  const [currentIdx, setCurrentIdx] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  // Initialize to the highlighted page if provided
  useEffect(() => {
    if (highlight) {
      setActiveTab('paper');
      setCurrentIdx(highlight.sourceImageIndex);
    }
  }, [highlight]);

  // Auto-scroll to highlight when page changes or gallery opens
  useEffect(() => {
    if (highlight && activeTab === 'paper' && currentIdx === highlight.sourceImageIndex && highlightRef.current) {
      // Use a very short delay to ensure image is in DOM, but behavior: 'auto' for instant jump
      const timer = setTimeout(() => {
        highlightRef.current?.scrollIntoView({
          behavior: 'auto',
          block: 'center',
          inline: 'center'
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentIdx, activeTab, highlight]);

  const images = activeTab === 'paper' ? paperImages : markingImages;
  const currentImage = images[currentIdx];

  const handleTabChange = (tab: 'paper' | 'marking') => {
    setActiveTab(tab);
    setCurrentIdx(0);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl cursor-pointer" onClick={onClose} />
      
      <div className="relative w-full h-full max-w-6xl flex flex-col bg-slate-900 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl pointer-events-auto">
        {/* Gallery Header */}
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/50">
          <div className="flex items-center space-x-4 bg-white/5 p-1 rounded-2xl border border-white/10">
            <button 
              onClick={() => handleTabChange('paper')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'paper' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Question Paper
            </button>
            {markingImages.length > 0 && (
              <button 
                onClick={() => handleTabChange('marking')}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'marking' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                Marking Scheme
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
             <div className="text-center text-white/40 text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block">
              {currentIdx + 1} of {images.length} Pages
            </div>
            <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all border border-white/10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Image Display Area */}
        <div className="flex-grow relative flex items-center justify-center overflow-hidden group">
          {images.length > 0 ? (
            <div 
              ref={scrollContainerRef}
              className="w-full h-full flex items-start justify-center overflow-auto p-4 scrollbar-hide relative"
            >
              <div className="relative inline-block w-full text-center">
                <img 
                  src={currentImage} 
                  className="mx-auto max-w-full h-auto object-contain rounded-lg shadow-2xl block" 
                  alt={`Page ${currentIdx + 1}`}
                />
                
                {/* Thin Highlight Border */}
                {highlight && activeTab === 'paper' && currentIdx === highlight.sourceImageIndex && (
                  <div 
                    ref={highlightRef}
                    className="absolute border-2 border-blue-500 rounded ring-4 ring-blue-500/20 pointer-events-none"
                    style={{
                      top: `${highlight.boundingBox[0] / 10}%`,
                      left: `${highlight.boundingBox[1] / 10}%`,
                      width: `${(highlight.boundingBox[3] - highlight.boundingBox[1]) / 10}%`,
                      height: `${(highlight.boundingBox[2] - highlight.boundingBox[0]) / 10}%`,
                    }}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="text-slate-500 font-bold">No images available in this section.</div>
          )}

          {/* Nav Buttons */}
          {images.length > 1 && (
            <>
              <button 
                onClick={() => setCurrentIdx(prev => (prev - 1 + images.length) % images.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-all border border-white/5 opacity-0 group-hover:opacity-100"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button 
                onClick={() => setCurrentIdx(prev => (prev + 1) % images.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-all border border-white/5 opacity-0 group-hover:opacity-100"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}
        </div>

        {/* Thumbnails Strip */}
        <div className="p-4 bg-slate-950/50 border-t border-white/5 overflow-x-auto flex justify-center space-x-2 scrollbar-hide">
          {images.map((img, i) => (
            <button 
              key={i}
              onClick={() => setCurrentIdx(i)}
              className={`w-12 h-16 rounded-md overflow-hidden border-2 transition-all flex-shrink-0 ${currentIdx === i ? 'border-blue-500 scale-110 shadow-lg' : 'border-white/10 opacity-50 hover:opacity-100'}`}
            >
              <img src={img} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SourceGallery;