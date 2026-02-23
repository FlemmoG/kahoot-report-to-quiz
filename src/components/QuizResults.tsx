import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';

interface QuizResultsProps {
  correct: number;
  incorrect: number;
  total: number;
  onRestart: () => void;
}

export function QuizResults({ correct, incorrect, total, onRestart }: QuizResultsProps) {
  const percentage = Math.min(Math.round((correct / total) * 100), 100);
  
  let grade = 'F';
  let gradeColor = 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50';
  
  if (percentage >= 90) {
    grade = 'A';
    gradeColor = 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50';
  } else if (percentage >= 80) {
    grade = 'B';
    gradeColor = 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50';
  } else if (percentage >= 70) {
    grade = 'C';
    gradeColor = 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/50';
  } else if (percentage >= 60) {
    grade = 'D';
    gradeColor = 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/50';
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700/50 p-8 sm:p-12 text-center relative overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-50 dark:from-indigo-900/20 to-transparent" />
      
      <div className="relative z-10">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-6 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center shadow-inner border border-yellow-200 dark:border-yellow-700/50"
        >
          <Trophy className="w-12 h-12 text-yellow-500 dark:text-yellow-400" />
        </motion.div>
        
        <h2 className="text-3xl font-bold mb-2 text-slate-800 dark:text-slate-100">Quiz Completed!</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-10">Here's how you performed</p>
        
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-7xl sm:text-8xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter"
            >
              {percentage}<span className="text-5xl sm:text-6xl text-indigo-400 dark:text-indigo-500">%</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className={`absolute -right-4 -top-4 sm:-right-8 sm:-top-2 px-4 py-1 rounded-full border-2 font-bold text-xl shadow-sm rotate-12 ${gradeColor}`}
            >
              {grade}
            </motion.div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30 rounded-2xl p-4 flex flex-col items-center"
          >
            <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
            <span className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{correct}</span>
            <span className="text-xs font-semibold text-green-600/70 dark:text-green-400/70 uppercase tracking-wider">Correct</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30 rounded-2xl p-4 flex flex-col items-center"
          >
            <XCircle className="w-8 h-8 text-red-500 mb-2" />
            <span className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">{incorrect}</span>
            <span className="text-xs font-semibold text-red-600/70 dark:text-red-400/70 uppercase tracking-wider">Incorrect</span>
          </motion.div>
        </div>
        
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={onRestart}
          className="flex items-center justify-center w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Start New Quiz
        </motion.button>
      </div>
    </motion.div>
  );
}
