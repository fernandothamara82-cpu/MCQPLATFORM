import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Question, QuizResult, QuizHistoryItem } from './types';
import { extractMCQsFromImages } from './services/geminiService';
import FileUpload from './components/FileUpload';
import QuizRunner from './components/QuizRunner';
import ResultsView from './components/ResultsView';
import LoadingScreen from './components/LoadingScreen';
import StudentDashboard from './components/StudentDashboard';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const [sourceImages, setSourceImages] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);
  const [error, setError] = useState<{ message: string; isQuota: boolean } | null>(null);
  const [quizTimeLimit, setQuizTimeLimit] = useState(30);

  useEffect(() => {
    const saved = localStorage.getItem('quiz_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const handleImagesSelected = async (paper: string[], marking: string[], timeLimit: number) => {
    setQuizTimeLimit(timeLimit);
    navigate('/processing');
    setSourceImages(paper);
    setError(null);
    try {
      const extractedQuestions = await extractMCQsFromImages(paper, marking);
      if (extractedQuestions.length === 0) {
        throw new Error("No questions were detected. Please try clearer images.");
      }
      setQuestions(extractedQuestions);
      navigate('/quiz');
    } catch (err: any) {
      console.error("Processing Error:", err);
      const errMessage = err.message || "Unknown error";
      const isQuota = errMessage.includes('429') || errMessage.includes('RESOURCE_EXHAUSTED');
      
      setError({ 
        message: isQuota 
          ? "Free Tier Limit Reached. Please wait 60 seconds and try again." 
          : `Processing Error: ${errMessage}`, 
        isQuota
      });
      navigate('/new');
    }
  };

  const handleQuizComplete = (quizResults: QuizResult[]) => {
    setResults(quizResults);
    const correctCount = quizResults.filter(r => r.isCorrect).length;
    const newItem: QuizHistoryItem = {
      id: `quiz-${Date.now()}`,
      timestamp: Date.now(),
      subject: questions[0]?.subject || 'General',
      score: correctCount,
      totalQuestions: questions.length,
      questions: questions,
      results: quizResults,
      sourceImages: sourceImages
    };

    const newHistory = [...history, newItem];
    setHistory(newHistory);
    localStorage.setItem('quiz_history', JSON.stringify(newHistory));
    navigate('/results');
  };

  const handleReviewQuiz = (item: QuizHistoryItem) => {
    setQuestions(item.questions);
    setResults(item.results);
    setSourceImages(item.sourceImages);
    navigate('/results');
  };

  const restart = () => {
    setError(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-30 glass border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={restart}>
            <div className="bg-blue-600 p-2 rounded-lg text-white font-black">AI</div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">PhysChem MCQ</h1>
          </div>
          <div className="flex items-center space-x-6">
            <button onClick={() => navigate('/')} className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Dashboard</button>
            <button onClick={() => navigate('/new')} className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all">New Quiz</button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        {error && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-3xl flex items-center justify-between animate-in slide-in-from-top-4">
            <div className="flex items-center space-x-4 text-red-900">
              <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div>
                <p className="font-bold">{error.message}</p>
                {error.isQuota && <p className="text-xs opacity-70 mt-1">Free tier accounts allow a limited number of requests per minute.</p>}
              </div>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 font-bold px-2">✕</button>
          </div>
        )}

        <Routes>
          <Route path="/" element={<StudentDashboard history={history} onNewQuiz={() => navigate('/new')} onReviewQuiz={handleReviewQuiz} />} />
          <Route path="/new" element={<FileUpload onImagesSelected={handleImagesSelected} />} />
          <Route path="/processing" element={<LoadingScreen />} />
          <Route path="/quiz" element={<QuizRunner questions={questions} sourceImages={sourceImages} timeLimit={quizTimeLimit} onComplete={handleQuizComplete} />} />
          <Route path="/results" element={<ResultsView questions={questions} results={results} sourceImages={sourceImages} onRestart={restart} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      
      <footer className="py-8 text-center border-t border-slate-100 mt-auto">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Optimized for Free Tier • Powered by Gemini AI</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;