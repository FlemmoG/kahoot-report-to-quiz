import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw } from 'lucide-react';

interface QuizResultsProps {
  correct: number;
  incorrect: number;
  total: number;
  onRestart: () => void;
}

export function QuizResults({ correct, incorrect, total, onRestart }: QuizResultsProps) {
  const percentage = Math.round((correct / total) * 100);
  
  let grade = 'F';
  if (percentage >= 90) grade = 'A';
  else if (percentage >= 80) grade = 'B';
  else if (percentage >= 70) grade = 'C';
  else if (percentage >= 60) grade = 'D';
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
    >
      <Trophy className="w-20 h-20 mx-auto mb-6 text-yellow-500" />
      <h2 className="text-3xl font-bold mb-2">Quiz Finished!</h2>
      <p className="text-gray-500 mb-8">Here is your result</p>
      
      <div className="flex justify-center items-end gap-4 mb-4">
        <div className="text-6xl font-black text-blue-600">
          {percentage}%
        </div>
        <div className="text-4xl font-bold text-gray-400 mb-1">
          Grade: <span className={
            grade === 'A' ? 'text-green-500' :
            grade === 'B' ? 'text-blue-500' :
            grade === 'C' ? 'text-yellow-500' :
            grade === 'D' ? 'text-orange-500' :
            'text-red-500'
          }>{grade}</span>
        </div>
      </div>
      
      <div className="flex justify-center gap-8 mb-8">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-green-500">{correct}</span>
          <span className="text-sm text-gray-500">Correct</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-red-500">{incorrect}</span>
          <span className="text-sm text-gray-500">Incorrect</span>
        </div>
      </div>
      
      <button
        onClick={onRestart}
        className="flex items-center justify-center w-full px-6 py-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl font-semibold transition-colors"
      >
        <RotateCcw className="w-5 h-5 mr-2" />
        Start New Quiz
      </button>
    </motion.div>
  );
}
