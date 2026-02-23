import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question, Answer, UserAnswer } from '@/lib/kahootParser';
import { CheckCircle2, XCircle, ArrowRight, BrainCircuit } from 'lucide-react';

interface QuizPlayerProps {
  questions: Question[];
  onFinish: (correct: number, incorrect: number, total: number, userAnswers: UserAnswer[], durationSeconds: number) => void;
}

export function QuizPlayer({ questions, onFinish }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Answer[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startRef = React.useRef<number | null>(null);
  const intervalRef = React.useRef<number | null>(null);

  const currentQuestion = questions[currentIndex];
  const progressPercentage = ((currentIndex) / questions.length) * 100;

  const handleAnswerClick = useCallback((answer: Answer) => {
    if (isRevealed) return; // Prevent clicks after revealing
    
    const hasMultipleCorrectAnswers = currentQuestion.answers.filter(a => a.isCorrect).length > 1;

    if (hasMultipleCorrectAnswers) {
      setSelectedAnswers(prev => {
        if (prev.includes(answer)) {
          return prev.filter(a => a !== answer);
        } else {
          return [...prev, answer];
        }
      });
    } else {
      // Single correct answer: select and reveal immediately
      setSelectedAnswers([answer]);
      setIsRevealed(true);
      
      setUserAnswers(prev => [...prev, { question: currentQuestion, selectedAnswers: [answer] }]);
      if (answer.isCorrect) {
        setCorrectCount(s => s + 1);
      } else {
        setIncorrectCount(s => s + 1);
      }
    }
  }, [isRevealed, currentQuestion]);

  const handleSubmit = useCallback(() => {
    if (isRevealed || selectedAnswers.length === 0) return;
    
    setIsRevealed(true);
    
    // Check if all selected answers are correct and all correct answers are selected
    const correctAnswers = currentQuestion.answers.filter(a => a.isCorrect);
    const isFullyCorrect = 
      selectedAnswers.length === correctAnswers.length &&
      selectedAnswers.every(a => a.isCorrect);
      
    setUserAnswers(prev => [...prev, { question: currentQuestion, selectedAnswers }]);
    
    if (isFullyCorrect) {
      setCorrectCount(s => s + 1);
    } else {
      setIncorrectCount(s => s + 1);
    }
  }, [isRevealed, selectedAnswers, currentQuestion]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedAnswers([]);
      setIsRevealed(false);
    } else {
      // compute duration
      const durationMs = startRef.current ? Date.now() - startRef.current : elapsedSeconds * 1000;
      const durationSeconds = Math.round(durationMs / 1000);
      // stop interval
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      onFinish(correctCount, incorrectCount, questions.length, userAnswers, durationSeconds);
    }
  }, [currentIndex, questions.length, onFinish, correctCount, incorrectCount, userAnswers, elapsedSeconds]);

  // start timer on mount of the player
  useEffect(() => {
    // initialize
    startRef.current = Date.now();
    intervalRef.current = window.setInterval(() => {
      if (startRef.current) {
        setElapsedSeconds(Math.floor((Date.now() - startRef.current) / 1000));
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [/* run when component mounts */]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentQuestion) return;

      if (isRevealed) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNext();
        }
      } else {
        const hasMultipleCorrectAnswers = currentQuestion.answers.filter(a => a.isCorrect).length > 1;
        
        if (hasMultipleCorrectAnswers && selectedAnswers.length > 0 && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleSubmit();
          return;
        }

        const keyMap: { [key: string]: number } = {
          '1': 0,
          '2': 1,
          '3': 2,
          '4': 3,
        };
        
        const index = keyMap[e.key];
        if (index !== undefined && index < currentQuestion.answers.length) {
          e.preventDefault();
          handleAnswerClick(currentQuestion.answers[index]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, isRevealed, selectedAnswers, handleNext, handleAnswerClick, handleSubmit]);

  function formatDuration(seconds: number | null | undefined) {
    if (seconds == null) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  if (!currentQuestion) return null;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header with Progress and Scores */}
      <div className="mb-6 flex flex-col gap-3">
        {/* Row 2: Info & Status */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Question {currentIndex + 1} <span className="text-slate-400 dark:text-slate-500 font-medium">/ {questions.length}</span>
            </span>
            {currentQuestion.isWeakness && (
              <span className="flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800/50">
                <BrainCircuit className="w-3 h-3" />
                Review
              </span>
            )}
          </div>
          
          <div className="flex gap-2 sm:gap-3">
            <div className="flex items-center gap-2 mr-2">
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full text-xs sm:text-sm font-bold border border-slate-200 dark:border-slate-700/50">
                <span className="font-mono">{formatDuration(elapsedSeconds)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold border border-green-200 dark:border-green-800/50">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{correctCount}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold border border-red-200 dark:border-red-800/50">
              <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{incorrectCount}</span>
            </div>
          </div>
        </div>

        {/* Row 3: Progress */}
        <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
          <motion.div 
            className="h-full bg-indigo-500 rounded-full"
            initial={{ width: `${((currentIndex - 1) / questions.length) * 100}%` }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700/50 p-6 sm:p-10"
        >
          <div className="min-h-[120px] flex flex-col items-center justify-center mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-slate-800 dark:text-slate-100 leading-tight">
              {currentQuestion.questionText}
            </h2>
            {currentQuestion.answers.filter(a => a.isCorrect).length > 1 && (
              <p className="mt-4 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                Select all correct answers
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {currentQuestion.answers.map((answer, idx) => {
              let buttonClass = "relative min-h-[80px] p-6 rounded-2xl text-lg font-semibold transition-all duration-200 border-2 flex items-center justify-center text-center ";
              
              const isSelected = selectedAnswers.includes(answer);

              if (!isRevealed) {
                if (isSelected) {
                  buttonClass += "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 shadow-sm z-10 scale-[1.02]";
                } else {
                  buttonClass += "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 hover:shadow-md hover:-translate-y-1";
                }
              } else {
                if (answer.isCorrect) {
                  buttonClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 shadow-sm z-10 scale-[1.02]";
                } else if (isSelected) {
                  buttonClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 shadow-sm z-10 scale-[1.02]";
                } else {
                  buttonClass += "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 opacity-60 scale-95";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerClick(answer)}
                  className={buttonClass}
                  disabled={isRevealed}
                >
                  {answer.text}
                  
                  {/* Icons for correct/incorrect answers after selection */}
                  {isRevealed && answer.isCorrect && (
                    <div className="absolute top-3 right-3 text-green-500">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  )}
                  {isRevealed && isSelected && !answer.isCorrect && (
                    <div className="absolute top-3 right-3 text-red-500">
                      <XCircle className="w-6 h-6" />
                    </div>
                  )}
                  {/* Icon for selected answer before reveal */}
                  {!isRevealed && isSelected && (
                    <div className="absolute top-3 right-3 text-indigo-500">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Fixed height container for the Next button to prevent layout shift */}
          <div className="mt-10 h-14 flex justify-center items-center">
            <AnimatePresence>
              {!isRevealed && selectedAnswers.length > 0 && currentQuestion.answers.filter(a => a.isCorrect).length > 1 && (
                <motion.button
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto justify-center"
                >
                  Submit Answer
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              )}
              {isRevealed && (
                <motion.button
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto justify-center"
                >
                  {currentIndex < questions.length - 1 ? 'Next Question' : 'Show Results'}
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
