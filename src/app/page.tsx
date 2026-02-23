'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { QuizPlayer } from '@/components/QuizPlayer';
import { QuizResults } from '@/components/QuizResults';
import { parseKahootExcel, Question, UserAnswer, shuffleArray } from '@/lib/kahootParser';
import { Loader2, X, Play, BrainCircuit } from 'lucide-react';

type QuizState = 'upload' | 'parsing' | 'playing' | 'results';

export default function Home() {
  const [state, setState] = useState<QuizState>('upload');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [attemptKey, setAttemptKey] = useState(0);

  const handleFilesSelect = (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
    setError(null);
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleStartQuiz = async () => {
    if (selectedFiles.length === 0) return;
    
    setState('parsing');
    setError(null);
    try {
      const allQuestionsArrays = await Promise.all(selectedFiles.map(parseKahootExcel));
      const parsedQuestions = allQuestionsArrays.flat();
      
      if (parsedQuestions.length === 0) {
        setError('No valid questions found in the files.');
        setState('upload');
        return;
      }

      // Get weak questions from localStorage
      const weakQuestionsStr = localStorage.getItem('weakQuestions');
      const weakQuestions: string[] = weakQuestionsStr ? JSON.parse(weakQuestionsStr) : [];

      // Separate into weak and normal
      const weak = parsedQuestions
        .filter(q => weakQuestions.includes(q.questionText))
        .map(q => ({ ...q, isWeakness: true }));
      const normal = parsedQuestions.filter(q => !weakQuestions.includes(q.questionText));

      // Shuffle both and combine (weak questions first)
      const finalQuestions = [...shuffleArray(weak), ...shuffleArray(normal)];

      setQuestions(finalQuestions);
      setAttemptKey(0);
      setState('playing');
    } catch (err) {
      console.error(err);
      setError('Error processing files.');
      setState('upload');
    }
  };

  const handleFinish = (correct: number, incorrect: number, total: number, answers: UserAnswer[], duration: number) => {
    setCorrectCount(correct);
    setIncorrectCount(incorrect);
    setUserAnswers(answers);
    setDurationSeconds(duration);
    
    // Update weak questions in localStorage
    const weakQuestionsStr = localStorage.getItem('weakQuestions');
    let weakQuestions: string[] = weakQuestionsStr ? JSON.parse(weakQuestionsStr) : [];
    
    answers.forEach(ans => {
      const correctAnswers = ans.question.answers.filter(a => a.isCorrect);
      const isFullyCorrect = 
        ans.selectedAnswers.length === correctAnswers.length &&
        ans.selectedAnswers.every(a => a.isCorrect);

      if (isFullyCorrect) {
        weakQuestions = weakQuestions.filter(q => q !== ans.question.questionText);
      } else {
        if (!weakQuestions.includes(ans.question.questionText)) {
          weakQuestions.push(ans.question.questionText);
        }
      }
    });
    
    localStorage.setItem('weakQuestions', JSON.stringify(weakQuestions));
    
    setState('results');
  };

  const handleRestart = () => {
    setQuestions([]);
    setUserAnswers([]);
    setCorrectCount(0);
    setIncorrectCount(0);
    setSelectedFiles([]);
    setState('upload');
  };

  const handleRetry = () => {
    // Reset per-attempt counters and remount the QuizPlayer
    setCorrectCount(0);
    setIncorrectCount(0);
    setUserAnswers([]);
    setAttemptKey(k => k + 1);
    setState('playing');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 pt-[max(2rem,env(safe-area-inset-top))] sm:pt-8 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans">
      <div className={`absolute top-[max(1rem,env(safe-area-inset-top))] sm:top-8 flex items-center gap-2 sm:gap-3 text-center opacity-80 ${state === 'playing' ? 'hidden sm:flex' : 'flex'}`}>
        <div className="p-1.5 sm:p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
          <BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-700 dark:text-slate-300">
          Kahoot to Quiz
        </h1>
      </div>

      {state === 'upload' && (
        <div className="w-full max-w-xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none p-8 sm:p-10 border border-slate-100 dark:border-slate-700/50">
          <div className="flex flex-col items-center w-full">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Upload your Kahoot Results</h2>
              <p className="text-slate-500 dark:text-slate-400">Transform your Kahoot Excel reports into an interactive quiz</p>
            </div>

            <FileUpload onFilesSelect={handleFilesSelect} />
            
            {selectedFiles.length > 0 && (
              <div className="w-full mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Selected Files</h3>
                <ul className="space-y-2 mb-8">
                  {selectedFiles.map((file, index) => (
                    <li key={`${file.name}-${index}`} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 group">
                      <span className="truncate mr-4 text-sm font-medium text-slate-700 dark:text-slate-300">{file.name}</span>
                      <button 
                        onClick={() => handleRemoveFile(index)}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-colors"
                        aria-label="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={handleStartQuiz}
                  className="w-full flex items-center justify-center px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Play className="w-5 h-5 mr-2 fill-current" />
                  Start Quiz
                </button>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium w-full text-center border border-red-100 dark:border-red-900/30">
                {error}
              </div>
            )}
          </div>
        </div>
      )}

      {state === 'parsing' && (
        <div className="flex flex-col items-center text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700/50">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="text-lg font-medium text-slate-600 dark:text-slate-300">Processing files...</p>
        </div>
      )}

      {state === 'playing' && (
        <QuizPlayer 
          key={attemptKey}
          questions={questions} 
          onFinish={handleFinish} 
        />
      )}

      {state === 'results' && (
        <QuizResults 
          correct={correctCount}
          incorrect={incorrectCount}
          total={questions.length}
          userAnswers={userAnswers}
          durationSeconds={durationSeconds}
          onRestart={handleRestart}
          onRetry={handleRetry}
        />
      )}
    </main>
  );
}
