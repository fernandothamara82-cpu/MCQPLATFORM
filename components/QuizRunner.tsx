import React, { useState, useEffect, useCallback } from 'react';
import { Question, QuizResult } from '../types';
import QuestionReference from './QuestionReference';

interface QuizRunnerProps {
  questions: Question[];
  sourceImages: string[];
  timeLimit: number;
  onComplete: (results: QuizResult[]) => void;
}

const QuizRunner: React.FC<QuizRunnerProps> = ({ questions, sourceImages, timeLimit, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[][]>(new Array(questions.length).fill([]));
  const [secondsRemaining, setSecondsRemaining] = useState(timeLimit * 60);
  const [isFinished, setIsFinished] = useState(false);
  
  const q = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleFinish = useCallback(() => {
    if (isFinished) return;
    setIsFinished(true);
    const results = questions.map((q, idx) => ({
      questionId: q.id,
      selectedOptionIndices: selectedAnswers[idx],
      isCorrect: JSON.stringify([...selectedAnswers[idx]].sort()) === JSON.stringify([...q.correctAnswerIndices].sort())
    }));
    onComplete(results);
  }, [questions, selectedAnswers, onComplete, isFinished]);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      handleFinish();
      return;
    }
    const timer = setInterval(() => {
      setSecondsRemaining(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsRemaining, handleFinish]);

  const toggleOption = (idx: number) => {
    const current = selectedAnswers[currentIndex];
    const isMultiSelect = q.correctAnswerIndices.length > 1;

    let next: number[];
    if (isMultiSelect) {
      next = current.includes(idx) ? current.filter(i => i !== idx) : [...current, idx];
    } else {
      next = [idx];
    }

    const newAnswers = [...selectedAnswers];
    newAnswers[currentIndex] = next;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timeColor = secondsRemaining < 60 ? 'text-red-600 animate-pulse' : 'text-slate-900';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex justify-between items-end px-2">
        <div>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Question {q.questionNumber || currentIndex + 1}</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-blue-600">{currentIndex + 1} / {questions.length}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Time Remaining</span>
          <span className={`text-2xl font-black ${timeColor} tabular-nums`}>{formatTime(secondsRemaining)}</span>
        </div>
      </div>
      
      <div className="w-full h-1.5 bg-slate-200 rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 min-h-[500px] flex flex-col">
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-4">
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${q.subject === 'Physics' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>{q.subject}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 leading-snug scientific-content" dangerouslySetInnerHTML={{ __html: q.questionText }} />
        </div>

        {q.diagram && (
          <QuestionReference 
            diagram={q.diagram} 
            sourceImages={sourceImages} 
            mode={q.hasVisualElements ? 'snippet' : 'compact'} 
          />
        )}

        <div className="grid grid-cols-1 gap-3 mb-8 flex-grow">
          {q.options.map((opt, idx) => {
            const isSelected = selectedAnswers[currentIndex].includes(idx);
            return (
              <button
                key={idx}
                onClick={() => toggleOption(idx)}
                className={`p-4 rounded-xl text-left border-2 transition-all flex items-center space-x-4 ${isSelected ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-slate-50 hover:border-slate-200 text-slate-700'}`}
              >
                <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs shrink-0 ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{String.fromCharCode(65 + idx)}</div>
                <span className="text-base scientific-content" dangerouslySetInnerHTML={{ __html: opt }} />
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-slate-50">
          <div className="flex items-center space-x-4">
            <button onClick={() => setCurrentIndex(c => Math.max(0, c - 1))} disabled={currentIndex === 0} className="text-slate-400 font-bold disabled:opacity-0 transition-opacity">Back</button>
            <button 
              onClick={() => {
                if (window.confirm("Are you sure you want to finish the quiz early?")) {
                  handleFinish();
                }
              }} 
              className="text-red-500 text-sm font-bold hover:underline"
            >
              Finish Early
            </button>
          </div>
          <button onClick={handleNext} className="px-12 py-3 bg-slate-900 text-white rounded-xl font-black hover:bg-slate-800 shadow-lg transition-all active:scale-95">
            {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizRunner;