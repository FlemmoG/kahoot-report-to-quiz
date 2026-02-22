import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question, Answer } from '@/lib/kahootParser';

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
      const finalCorrect = correctCount + (selectedAnswer?.isCorrect ? 1 : 0);
      const finalIncorrect = incorrectCount + (selectedAnswer && !selectedAnswer.isCorrect ? 1 : 0);
      onFinish(finalCorrect, finalIncorrect, questions.length);
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-8 flex justify-between items-center text-sm font-medium text-gray-500">
        <span>Question {currentIndex + 1} of {questions.length}</span>
        <div className="flex gap-4">
          <span className="text-green-600 dark:text-green-400">Correct: {correctCount}</span>
          <span className="text-red-600 dark:text-red-400">Incorrect: {incorrectCount}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold mb-8 text-center">
            {currentQuestion.questionText}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.answers.map((answer, idx) => {
              let buttonClass = "p-6 rounded-xl text-lg font-semibold transition-all border-2 ";
              
              if (!selectedAnswer) {
                buttonClass += "border-gray-200 hover:border-blue-500 hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-gray-700";
              } else {
                if (answer.isCorrect) {
                  buttonClass += "border-green-500 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
                } else if (selectedAnswer === answer) {
                  buttonClass += "border-red-500 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
                } else {
                  buttonClass += "border-gray-200 opacity-50 dark:border-gray-700";
                }
              }

              return (
                <motion.button
                  key={idx}
                  whileHover={!selectedAnswer ? { scale: 1.02 } : {}}
                  whileTap={!selectedAnswer ? { scale: 0.98 } : {}}
                  onClick={() => handleAnswerClick(answer)}
                  className={buttonClass}
                  disabled={!!selectedAnswer}
                >
                  {answer.text}
                </motion.button>
              );
            })}
          </div>

          {selectedAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 32 }}
              className="flex justify-center"
            >
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-colors"
              >
                {currentIndex < questions.length - 1 ? 'Next Question' : 'Show Results'}
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
