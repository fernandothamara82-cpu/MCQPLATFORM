import React, { useState, useRef, useEffect } from 'react';

interface CropModalProps {
  imageSrc: string;
  onCrop: (croppedBase64: string) => void;
  onClose: () => void;
}

const CropModal: React.FC<CropModalProps> = ({ imageSrc, onCrop, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [selection, setSelection] = useState({ x: 0, y: 0, w: 0, h: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPos({ x, y });
    setCurrentPos({ x, y });
    setIsDragging(true);
    setSelection({ x, y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    setCurrentPos({ x, y });
    
    setSelection({
      x: Math.min(x, startPos.x),
      y: Math.min(y, startPos.y),
      w: Math.abs(x - startPos.x),
      h: Math.abs(y - startPos.y)
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const performCrop = () => {
    if (!imgRef.current || selection.w < 10) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate scaling
    const scaleX = imgRef.current.naturalWidth / imgRef.current.clientWidth;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.clientHeight;

    canvas.width = selection.w * scaleX;
    canvas.height = selection.h * scaleY;

    ctx.drawImage(
      imgRef.current,
      selection.x * scaleX,
      selection.y * scaleY,
      selection.w * scaleX,
      selection.h * scaleY,
      0, 0,
      canvas.width,
      canvas.height
    );

    onCrop(canvas.toDataURL('image/jpeg', 0.9));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Refine Image Area</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Drag to select a specific section for better OCR</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div 
          ref={containerRef}
          className="flex-grow relative overflow-auto bg-slate-200 cursor-crosshair select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img 
            ref={imgRef}
            src={imageSrc} 
            className="block max-w-none min-w-full pointer-events-none"
            alt="To crop"
            draggable={false}
          />
          
          {selection.w > 0 && (
            <div 
              className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none"
              style={{
                left: selection.x,
                top: selection.y,
                width: selection.w,
                height: selection.h
              }}
            >
              <div className="absolute inset-0 border border-white/30" />
              <div className="absolute top-0 left-0 bg-blue-500 text-white text-[9px] px-1 font-black">CROP AREA</div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t flex justify-between items-center">
          <button onClick={onClose} className="px-6 py-2 text-slate-500 font-bold text-sm">Cancel</button>
          <div className="flex space-x-2">
             <button 
              onClick={() => { setSelection({ x: 0, y: 0, w: 0, h: 0 }); }} 
              className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm"
            >
              Reset
            </button>
            <button 
              onClick={performCrop}
              disabled={selection.w < 20}
              className="px-8 py-2 bg-blue-600 text-white rounded-xl font-black text-sm disabled:opacity-50 shadow-lg shadow-blue-100"
            >
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropModal;