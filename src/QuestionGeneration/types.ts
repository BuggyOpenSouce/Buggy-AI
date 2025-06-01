export interface Question {
  id: string;
  content: string;
  answer: string;
  userAnswer?: string;
  isCorrect?: boolean;
  drawings: Drawing[];
}

export interface Topic {
  id: string;
  name: string;
  questionCount: number;
  questions: Question[];
}

export interface Drawing {
  points: Point[];
  tool: 'pen' | 'eraser';
  color: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface QuestionProvider {
  id: string;
  name: string;
  key: string;
  model: string;
  available: boolean;
  busy: boolean;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}