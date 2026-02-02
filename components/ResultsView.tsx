import React, { useState } from 'react';
import { Question, QuizResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import QuestionReference from './QuestionReference';
import SourceGallery from './SourceGallery';

interface ResultsViewProps {
  questions: Question[];
  results: QuizResult[];
  sourceImages: string[];
  markingImages: string[];
  onRestart: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ questions, results, sourceImages, markingImages, onRestart }) => {
  const [galleryState, setGalleryState] = useState<{ isOpen: boolean, highlight?: { sourceImageIndex: number, boundingBox: [number, number, number, number] } }>({ isOpen: false });
  const correctCount = results.filter(r => r.isCorrect).length;
  const scorePercentage = Math.round((correctCount / questions.length) * 100);

  const chartData = [
    { name: 'Correct', value: correctCount },
    { name: 'Incorrect', value: questions.length - correctCount },
  ];
  const COLORS = ['#10b981', '#ef4444'];

  const openGalleryAtQuestion = (q: Question) => {
    if (q.diagram) {
      setGalleryState({ 
        isOpen: true, 
        highlight: { 
          sourceImageIndex: q.diagram.sourceImageIndex, 
          boundingBox: q.diagram.boundingBox 
        } 
      });
    } else {
      setGalleryState({ isOpen: true });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-3xl font-black text-slate-800">Performance Report</h2>
          <button 
            onClick={() => setGalleryState({ isOpen: true })}
            className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <span>Review Source Scans</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
          <div className="h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={chartData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-left bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <p className="text-6xl font-black text-slate-900 mb-2">{scorePercentage}%</p>
            <p className="text-slate-600 font-medium">Correct: <span className="text-emerald-600 font-bold">{correctCount}</span> / {questions.length}</p>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button onClick={onRestart} className="py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100">New Quiz</button>
              <button onClick={() => window.print()} className="py-3 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold text-sm">Save PDF</button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-black text-slate-800 px-2 uppercase tracking-widest flex items-center">
          <div className="w-2 h-2 bg-blue-600 rounded-full mr-3" />
          Detailed Review
        </h3>
        {questions.map((q, idx) => {
          const result = results.find(r => r.questionId === q.id);
          const isCorrect = result?.isCorrect;
          
          return (
            <div key={q.id} className={`bg-white rounded-3xl p-6 shadow-md border-l-8 ${isCorrect ? 'border-emerald-500' : 'border-red-500'} animate-in slide-in-from-bottom-2 duration-300`} style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                   <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Question {q.questionNumber || idx + 1}</span>
                   <button 
                    onClick={() => openGalleryAtQuestion(q)}
                    className="text-[9px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded uppercase hover:bg-blue-100 transition-colors"
                   >
                     Locate in Source
                   </button>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              
              <p className="text-lg font-bold text-slate-800 mb-4 scientific-content" dangerouslySetInnerHTML={{ __html: q.questionText }} />
              
              {q.diagram && (
                <QuestionReference 
                  diagram={q.diagram} 
                  sourceImages={sourceImages} 
                  mode={q.hasVisualElements ? 'snippet' : 'compact'} 
                />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                {q.options.map((opt, oIdx) => {
                  const isCorrectAnswer = q.correctAnswerIndices.includes(oIdx);
                  const isUserSelected = result?.selectedOptionIndices.includes(oIdx);
                  
                  let style = "bg-slate-50 border-slate-100 text-slate-500";
                  if (isCorrectAnswer) style = "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold";
                  if (isUserSelected && !isCorrectAnswer) style = "bg-red-50 border-red-200 text-red-800 font-bold";

                  return (
                    <div key={oIdx} className={`p-4 rounded-xl text-sm border flex items-center ${style}`}>
                      <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] mr-3 ${isCorrectAnswer ? 'bg-emerald-500 text-white' : isUserSelected ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        {String.fromCharCode(65 + oIdx)}
                      </div>
                      <span className="scientific-content" dangerouslySetInnerHTML={{ __html: opt }} />
                    </div>
                  );
                })}
              </div>

              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2 flex items-center">
                   <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Detailed Analysis
                </h4>
                <p className="text-slate-700 text-sm leading-relaxed scientific-content" dangerouslySetInnerHTML={{ __html: q.explanation }} />
              </div>
            </div>
          );
        })}
      </div>

      {galleryState.isOpen && (
        <SourceGallery 
          paperImages={sourceImages} 
          markingImages={markingImages} 
          highlight={galleryState.highlight}
          onClose={() => setGalleryState({ isOpen: false })} 
        />
      )}
    </div>
  );
};

export default ResultsView;
