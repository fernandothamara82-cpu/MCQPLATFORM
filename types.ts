
export interface MCQOption {
  text: string;
}

export interface DiagramInfo {
  sourceImageIndex: number;
  boundingBox: [number, number, number, number];
}

export interface Question {
  id: string;
  questionNumber: string;
  questionText: string;
  options: string[];
  correctAnswerIndices: number[];
  explanation: string;
  subject: 'Physics' | 'Chemistry' | 'General';
  hasVisualElements: boolean;
  diagram?: DiagramInfo;
  markingSchemeData?: {
    originalValue: string;
    isCorrectedByAI: boolean;
    aiComment?: string;
  };
}

export interface QuizResult {
  questionId: string;
  selectedOptionIndices: number[];
  isCorrect: boolean;
}

export interface QuizHistoryItem {
  id: string;
  timestamp: number;
  quizTitle: string;
  subject: string;
  score: number;
  totalQuestions: number;
  questions: Question[];
  results: QuizResult[];
  sourceImages: string[];
  markingImages?: string[];
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  PROCESSING = 'PROCESSING',
  QUIZ = 'QUIZ',
  RESULTS = 'RESULTS'
}
