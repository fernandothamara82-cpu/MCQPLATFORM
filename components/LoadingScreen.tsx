
import React, { useState, useEffect } from 'react';

const LoadingScreen: React.FC = () => {
  const [messageIdx, setMessageIdx] = useState(0);
  const messages = [
    "Analyzing paper layout...",
    "OCR-ing scientific notation...",
    "Solving Physics formulas...",
    "Balancing Chemistry equations...",
    "Identifying correct answers...",
    "Preparing your interactive quiz...",
    "Almost there..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIdx(prev => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-4 bg-blue-50 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.618.309a6 6 0 01-3.86.517l-2.387-.477a2 2 0 00-1.022.547l-1.16 1.16a2 2 0 000 2.828l1.414 1.414a2 2 0 002.828 0l1.16-1.16a2 2 0 00.547-1.022l.477-2.387a6 6 0 01.517-3.86l.309-.618a6 6 0 00.517-3.86l-.477-2.387a2 2 0 00-.547-1.022l-1.16-1.16a2 2 0 00-2.828 0l-1.414 1.414a2 2 0 000 2.828l1.16 1.16z" />
          </svg>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-2">Transforming Paper...</h3>
      <p className="text-blue-600 font-medium animate-pulse">{messages[messageIdx]}</p>
      
      <div className="mt-12 max-w-sm w-full bg-slate-100 rounded-full h-1 overflow-hidden">
        <div className="bg-blue-600 h-full animate-[loading_10s_ease-in-out_infinite]"></div>
      </div>

      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
