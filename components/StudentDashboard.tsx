
import React, { useMemo } from 'react';
import { QuizHistoryItem } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StudentDashboardProps {
  history: QuizHistoryItem[];
  onNewQuiz: () => void;
  onReviewQuiz: (item: QuizHistoryItem) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ history, onNewQuiz, onReviewQuiz }) => {
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

  const chartData = useMemo(() => {
    return history
      .slice(-10)
      .map(item => ({
        date: new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        accuracy: Math.round((item.score / item.totalQuestions) * 100)
      }));
  }, [history]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Welcome back!</h2>
          <p className="text-slate-500 font-medium">Here's your scientific performance summary.</p>
        </div>
        <button 
          onClick={onNewQuiz}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
          <span>New Quiz</span>
        </button>
      </div>

      {!stats ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800">No History Yet</h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-2 mb-6">Start your first quiz by uploading a physics or chemistry paper.</p>
          <button onClick={onNewQuiz} className="text-blue-600 font-bold hover:underline">Get Started &rarr;</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Accuracy</span>
              <p className="text-4xl font-black text-slate-900 mt-1">{stats.avgScore}%</p>
              <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${stats.avgScore}%` }} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Questions Done</span>
              <p className="text-4xl font-black text-slate-900 mt-1">{stats.totalQuestions}</p>
              <p className="text-xs text-slate-500 mt-2 font-medium">Across {stats.totalQuizzes} attempts</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Subject</span>
              <p className="text-4xl font-black text-slate-900 mt-1 truncate">{stats.topSubject}</p>
              <p className="text-xs text-slate-500 mt-2 font-medium">Focus area</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Streak</span>
              <p className="text-4xl font-black text-slate-900 mt-1">1</p>
              <p className="text-xs text-slate-500 mt-2 font-medium">Quizzes today</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Accuracy Trend</h3>
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
              <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Quizzes</h3>
              <div className="space-y-4 flex-grow overflow-y-auto max-h-[300px] pr-2">
                {history.slice().reverse().map((item) => (
                  <div key={item.id} className="group p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                      <span className={`text-xs font-bold ${item.score/item.totalQuestions >= 0.7 ? 'text-emerald-600' : 'text-slate-600'}`}>
                        {item.score}/{item.totalQuestions}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-slate-800">{item.subject}</p>
                      <button 
                        onClick={() => onReviewQuiz(item)}
                        className="text-xs font-black text-blue-600 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentDashboard;