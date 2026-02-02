import React, { useState } from 'react';
import CropModal from './CropModal';

interface FileUploadProps {
  onImagesSelected: (paperImages: string[], markingImages: string[], timeLimitMinutes: number) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onImagesSelected }) => {
  const [paperPreviews, setPaperPreviews] = useState<string[]>([]);
  const [markingPreviews, setMarkingPreviews] = useState<string[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [timeLimit, setTimeLimit] = useState(30);
  const [cropTarget, setCropTarget] = useState<{ idx: number, type: 'paper' | 'marking', src: string } | null>(null);

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'paper' | 'marking') => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    setIsReading(true);
    try {
      const newImages = await Promise.all(files.map(file => readFileAsDataURL(file)));
      if (type === 'paper') {
        setPaperPreviews(prev => [...prev, ...newImages]);
      } else {
        setMarkingPreviews(prev => [...prev, ...newImages]);
      }
    } catch (err) {
      console.error("Error reading files:", err);
    } finally {
      setIsReading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number, type: 'paper' | 'marking') => {
    if (type === 'paper') setPaperPreviews(prev => prev.filter((_, i) => i !== index));
    else setMarkingPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleCropComplete = (croppedBase64: string) => {
    if (!cropTarget) return;
    const { idx, type } = cropTarget;
    if (type === 'paper') {
      const next = [...paperPreviews];
      next[idx] = croppedBase64;
      setPaperPreviews(next);
    } else {
      const next = [...markingPreviews];
      next[idx] = croppedBase64;
      setMarkingPreviews(next);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-5xl font-black text-slate-900 mb-3 tracking-tighter">MCQ Platform</h2>
        <p className="text-slate-500 max-w-lg mx-auto font-medium">
          Transform physical Physics & Chemistry papers into digital interactive quizzes. Refine images to improve Sinhala OCR.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Paper Column */}
        <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-blue-100 italic">1</div>
            Question Paper
          </h3>
          <label className="block w-full cursor-pointer group">
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center group-hover:border-blue-400 transition-all bg-slate-50 group-hover:bg-blue-50/30">
              <div className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
              </div>
              <span className="text-sm font-black text-slate-600 uppercase tracking-widest">Add Pages</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'paper')} />
            </div>
          </label>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {paperPreviews.map((src, i) => (
              <div key={i} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-slate-200 group shadow-sm bg-slate-100">
                <img src={src} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 p-2">
                  <button 
                    onClick={() => setCropTarget({ idx: i, type: 'paper', src })}
                    className="p-2 bg-white text-blue-600 rounded-lg shadow-lg font-black text-[10px] uppercase tracking-tighter"
                  >
                    Crop
                  </button>
                  <button 
                    onClick={() => removeImage(i, 'paper')} 
                    className="p-2 bg-white text-red-600 rounded-lg shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Page {i+1}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Marking Scheme Column & Timer */}
        <div className="flex flex-col space-y-8">
          <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-emerald-100 italic">2</div>
              Marking Scheme <span className="text-slate-400 font-normal ml-2 italic text-sm">Optional</span>
            </h3>
            <label className="block w-full cursor-pointer group">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center group-hover:border-emerald-400 transition-all bg-slate-50 group-hover:bg-emerald-50/30">
                <div className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <span className="text-sm font-black text-slate-600 uppercase tracking-widest">Add Scheme</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'marking')} />
              </div>
            </label>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {markingPreviews.map((src, i) => (
                <div key={i} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-slate-200 group shadow-sm bg-slate-100">
                  <img src={src} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 p-2">
                    <button 
                      onClick={() => setCropTarget({ idx: i, type: 'marking', src })}
                      className="p-2 bg-white text-emerald-600 rounded-lg shadow-lg font-black text-[10px] uppercase tracking-tighter"
                    >
                      Crop
                    </button>
                    <button onClick={() => removeImage(i, 'marking')} className="p-2 bg-white text-red-600 rounded-lg shadow-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-amber-100 italic">3</div>
              Quiz Timer
            </h3>
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Duration (Minutes)</p>
              <div className="flex items-center space-x-4">
                <input 
                  type="range" 
                  min="1" 
                  max="180" 
                  value={timeLimit} 
                  onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                  className="flex-grow accent-amber-500"
                />
                <span className="w-12 text-center font-black text-slate-800">{timeLimit}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[15, 30, 45, 60, 90, 120].map(m => (
                  <button 
                    key={m}
                    onClick={() => setTimeLimit(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${timeLimit === m ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4 pt-4">
        <button
          onClick={() => onImagesSelected(paperPreviews, markingPreviews, timeLimit)}
          disabled={paperPreviews.length === 0 || isReading}
          className="px-16 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xl hover:bg-slate-800 disabled:bg-slate-200 transition-all shadow-2xl active:scale-95 flex items-center space-x-3"
        >
          {isReading ? 'Reading Files...' : 'Analyze & Generate Quiz'}
        </button>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Powered by Gemini 3.0 Vision AI</p>
      </div>

      {cropTarget && (
        <CropModal 
          imageSrc={cropTarget.src} 
          onCrop={handleCropComplete} 
          onClose={() => setCropTarget(null)} 
        />
      )}
    </div>
  );
};

export default FileUpload;