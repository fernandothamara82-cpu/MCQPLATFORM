import React, { useMemo, useState } from 'react';
import { QuizHistoryItem } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StudentDashboardProps {
  history: QuizHistoryItem[];
  onNewQuiz: () => void;
  onReviewQuiz: (item: QuizHistoryItem) => void;
  onDeleteRecord: (id: string) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ history, onNewQuiz, onReviewQuiz, onDeleteRecord }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const stats = useMemo(() => {
    if (history.length === 0) return null;
    const totalQuestions = history.reduce((acc, curr) => acc + curr.totalQuestions, 0);
    const avgScore = history.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / history.length;
    const subjects = history.reduce((acc: any, curr) => {
      acc[curr.subject] = (acc[curr.subject] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalQuestions,
      avgScore: Math.round(avgScore * 100),
      totalQuizzes: history.length,
      topSubject: Object.entries(subjects).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A'
    };
  }, [history]);

  const filteredHistory = useMemo(() => {
    if (!searchTerm) return history;
    const term = searchTerm.toLowerCase();
    return history.filter(item => 
      item.quizTitle.toLowerCase().includes(term) || 
      item.subject.toLowerCase().includes(term)
    );
  }, [history, searchTerm]);

  const chartData = useMemo(() => {
    return history
      .slice(-10)
      .map(item => ({
        date: new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        accuracy: Math.round((item.score / item.totalQuestions) * 100)
      }));
  }, [history]);

  const exportHistory = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `my_study_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">My Study Library</h2>
          <p className="text-slate-500 font-medium">Tracking personal performance across exam papers.</p>
        </div>
        <div className="flex space-x-3">
          {history.length > 0 && (
            <button 
              onClick={exportHistory}
              className="bg-white border-2 border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 8l-4 4m0 0l-4-4m4 4V4" /></svg>
              <span>Backup Data</span>
            </button>
          )}
          <button 
            onClick={onNewQuiz}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            <span>Scan New Paper</span>
          </button>
        </div>
      </div>

      {!stats ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800">No Records Yet</h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-2 mb-6">Start by scanning a physics or chemistry paper to build your personal library.</p>
          <button onClick={onNewQuiz} className="text-blue-600 font-bold hover:underline">Conduct First Test &rarr;</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average Accuracy</span>
              <p className="text-4xl font-black text-slate-900 mt-1">{stats.avgScore}%</p>
              <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${stats.avgScore}%` }} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saved Tests</span>
              <p className="text-4xl font-black text-slate-900 mt-1">{stats.totalQuizzes}</p>
              <p className="text-xs text-slate-500 mt-2 font-medium">In your library</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Discipline</span>
              <p className="text-4xl font-black text-slate-900 mt-1 truncate">{stats.topSubject}</p>
              <p className="text-xs text-slate-500 mt-2 font-medium">Most practiced</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total MCQs Solved</span>
              <p className="text-4xl font-black text-slate-900 mt-1">{stats.totalQuestions}</p>
              <p className="text-xs text-slate-500 mt-2 font-medium">Correctly digitized</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Performance Trend</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                    />
                    <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Past Sessions</h3>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white transition-all outline-none"
                  />
                  <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>

              <div className="space-y-4 flex-grow overflow-y-auto max-h-[400px] pr-2 scrollbar-hide">
                {filteredHistory.slice().reverse().map((item) => (
                  <div key={item.id} className="group p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 relative">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {new Date(item.timestamp).toLocaleDateString()} • {item.subject}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-bold ${item.score/item.totalQuestions >= 0.7 ? 'text-emerald-600' : 'text-slate-600'}`}>
                          {item.score}/{item.totalQuestions}
                        </span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); if(confirm("Permanently delete this test session?")) onDeleteRecord(item.id); }}
                          className="text-red-300 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-slate-800 truncate pr-4">{item.quizTitle}</p>
                      <button 
                        onClick={() => onReviewQuiz(item)}
                        className="text-[10px] font-black text-blue-600 bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-sm uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
                {filteredHistory.length === 0 && (
                  <p className="text-center py-8 text-slate-400 text-sm font-medium">No tests matching "{searchTerm}"</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentDashboard;
