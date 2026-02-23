import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question, Answer } from '@/lib/kahootParser';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface QuizPlayerProps {
  questions: Question[];
  onFinish: (correct: number, incorrect: number, total: number) => void;
}

export function QuizPlayer({ questions, onFinish }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  const currentQuestion = questions[currentIndex];
  const progressPercentage = ((currentIndex) / questions.length) * 100;

  const handleAnswerClick = (answer: Answer) => {
    if (selectedAnswer) return; // Prevent multiple clicks
    
    setSelectedAnswer(answer);
    if (answer.isCorrect) {
      setCorrectCount(s => s + 1);
    } else {
      setIncorrectCount(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
    } else {
      onFinish(correctCount, incorrectCount, questions.length);
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header with Progress and Scores */}
      <div className="mb-6 flex flex-col gap-3">
        {/* Row 2: Info & Status */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Question {currentIndex + 1} <span className="text-slate-400 dark:text-slate-500 font-medium">/ {questions.length}</span>
          </span>
          
          <div className="flex gap-2 sm:gap-3">
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
          <div className="min-h-[120px] flex items-center justify-center mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-slate-800 dark:text-slate-100 leading-tight">
              {currentQuestion.questionText}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {currentQuestion.answers.map((answer, idx) => {
              let buttonClass = "relative min-h-[80px] p-6 rounded-2xl text-lg font-semibold transition-all duration-200 border-2 flex items-center justify-center text-center ";
              
              if (!selectedAnswer) {
                buttonClass += "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 hover:shadow-md hover:-translate-y-1";
              } else {
                if (answer.isCorrect) {
                  buttonClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 shadow-sm z-10 scale-[1.02]";
                } else if (selectedAnswer === answer) {
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
                  disabled={!!selectedAnswer}
                >
                  {answer.text}
                  
                  {/* Icons for correct/incorrect answers after selection */}
                  {selectedAnswer && answer.isCorrect && (
                    <div className="absolute top-3 right-3 text-green-500">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  )}
                  {selectedAnswer && selectedAnswer === answer && !answer.isCorrect && (
                    <div className="absolute top-3 right-3 text-red-500">
                      <XCircle className="w-6 h-6" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Fixed height container for the Next button to prevent layout shift */}
          <div className="mt-10 h-14 flex justify-center items-center">
            <AnimatePresence>
              {selectedAnswer && (
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
