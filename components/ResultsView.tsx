
import React from 'react';
import { Question, QuizResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import QuestionReference from './QuestionReference';

interface ResultsViewProps {
  questions: Question[];
  results: QuizResult[];
  sourceImages: string[];
  onRestart: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ questions, results, sourceImages, onRestart }) => {
  const correctCount = results.filter(r => r.isCorrect).length;
  const scorePercentage = Math.round((correctCount / questions.length) * 100);

  const chartData = [
    { name: 'Correct', value: correctCount },
    { name: 'Incorrect', value: questions.length - correctCount },
  ];
  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center">
        <h2 className="text-4xl font-extrabold text-slate-800 mb-6">Quiz Results</h2>
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
          <div className="text-left bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p className="text-6xl font-black text-slate-900 mb-2">{scorePercentage}%</p>
            <p className="text-slate-600">Correct: <span className="text-emerald-600 font-bold">{correctCount}</span> / {questions.length}</p>
            <button onClick={onRestart} className="mt-4 w-full py-3 bg-blue-600 text-white rounded-xl font-bold">New Quiz</button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-800 px-2">Detailed Review</h3>
        {questions.map((q, idx) => {
          const result = results.find(r => r.questionId === q.id);
          const isCorrect = result?.isCorrect;
          
          return (
            <div key={q.id} className={`bg-white rounded-2xl p-6 shadow-md border-l-8 ${isCorrect ? 'border-emerald-500' : 'border-red-500'}`}>
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Question {q.questionNumber || idx + 1}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
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
                    <div key={oIdx} className={`p-3 rounded-lg text-sm border ${style}`}>
                      <span className="mr-2">{String.fromCharCode(65 + oIdx)}.</span> 
                      <span className="scientific-content" dangerouslySetInnerHTML={{ __html: opt }} />
                    </div>
                  );
                })}
              </div>

              <div className="bg-blue-50 p-4 rounded-xl">
                <h4 className="text-[10px] font-black text-blue-600 uppercase mb-2">Scientific Explanation</h4>
                <p className="text-slate-700 text-sm leading-relaxed scientific-content" dangerouslySetInnerHTML={{ __html: q.explanation }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultsView;