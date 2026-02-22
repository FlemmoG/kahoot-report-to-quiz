'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { QuizPlayer } from '@/components/QuizPlayer';
import { QuizResults } from '@/components/QuizResults';
import { parseKahootExcel, Question } from '@/lib/kahootParser';
import { Loader2, X, Play } from 'lucide-react';

type QuizState = 'upload' | 'parsing' | 'playing' | 'results';

export default function Home() {
  const [state, setState] = useState<QuizState>('upload');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

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
      setQuestions(parsedQuestions);
      setState('playing');
    } catch (err) {
      console.error(err);
      setError('Error processing files.');
      setState('upload');
    }
  };

  const handleFinish = (correct: number, incorrect: number) => {
    setCorrectCount(correct);
    setIncorrectCount(incorrect);
    setState('results');
  };

  const handleRestart = () => {
    setQuestions([]);
    setCorrectCount(0);
    setIncorrectCount(0);
    setSelectedFiles([]);
    setState('upload');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="absolute top-8 text-center">
        <h1 className="text-4xl font-black tracking-tight text-blue-600 dark:text-blue-400">
          Kahoot Results to Quiz
        </h1>
      </div>

      {state === 'upload' && (
        <div className="flex flex-col items-center w-full max-w-md">
          <FileUpload onFilesSelect={handleFilesSelect} />
          
          {selectedFiles.length > 0 && (
            <div className="w-full mt-8">
              <h3 className="text-lg font-semibold mb-4">Selected Files:</h3>
              <ul className="space-y-2 mb-6">
                {selectedFiles.map((file, index) => (
                  <li key={`${file.name}-${index}`} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <span className="truncate mr-4 text-sm">{file.name}</span>
                    <button 
                      onClick={() => handleRemoveFile(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove file"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={handleStartQuiz}
                className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-md"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Quiz
              </button>
            </div>
          )}

          {error && (
            <p className="mt-4 text-red-500 font-medium">{error}</p>
          )}
        </div>
      )}

      {state === 'parsing' && (
        <div className="flex flex-col items-center text-gray-500">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="text-lg font-medium">Processing files...</p>
        </div>
      )}

      {state === 'playing' && (
        <QuizPlayer 
          questions={questions} 
          onFinish={handleFinish} 
        />
      )}

      {state === 'results' && (
        <QuizResults 
          correct={correctCount}
          incorrect={incorrectCount}
          total={questions.length} 
          onRestart={handleRestart} 
        />
      )}
    </main>
  );
}
