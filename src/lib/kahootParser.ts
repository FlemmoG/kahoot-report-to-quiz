import * as xlsx from 'xlsx';

export type Answer = {
  text: string;
  isCorrect: boolean;
};

export type Question = {
  id: string;
  questionText: string;
  answers: Answer[];
  isWeakness?: boolean;
};

export type UserAnswer = {
  question: Question;
  selectedAnswer: Answer | null;
};

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export async function parseKahootExcel(file: File): Promise<Question[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = xlsx.read(data, { type: 'array' });
        
        const questions: Question[] = [];
        
        for (const sheetName of workbook.SheetNames) {
          // Only process sheets that look like questions (e.g., "15 Quiz", "3 True or False")
          if (!sheetName.includes('Quiz') && !sheetName.includes('True or False')) {
            continue;
          }
          
          const sheet = workbook.Sheets[sheetName];
          const sheetData = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1 });
          
          // Check if it has the expected structure
          if (sheetData.length < 10) continue;
          
          // Find the question text row
          // Usually row 1 (0-indexed) is the question row: ['15 Quiz', 'What type of...']
          const qRow = sheetData[1];
          if (!qRow || !qRow[1]) continue;
          
          const questionText = qRow[1];
          
          // Find the "Answer options" row
          const answerOptionsRowIndex = sheetData.findIndex(row => row[0] === 'Answer options');
          const isAnswerCorrectRowIndex = sheetData.findIndex(row => row[0] === 'Is answer correct?');
          
          if (answerOptionsRowIndex === -1 || isAnswerCorrectRowIndex === -1) {
            // Skip questions without predefined answer options
            continue;
          }
          
          const answerOptionsRow = sheetData[answerOptionsRowIndex];
          const isAnswerCorrectRow = sheetData[isAnswerCorrectRowIndex];
          
          const answers: Answer[] = [];
          
          // Answers are typically at indices 3, 5, 7, 9
          for (let i = 3; i <= 9; i += 2) {
            const answerText = answerOptionsRow[i];
            if (answerText) {
              const correctnessIndicator = isAnswerCorrectRow[i - 1];
              const isCorrect = correctnessIndicator === '✔︎';
              answers.push({
                text: String(answerText),
                isCorrect
              });
            }
          }
          
          // Only include questions that have at least one correct answer
          // This filters out open-ended or feedback questions
          const hasCorrectAnswer = answers.some(a => a.isCorrect);
          
          if (answers.length > 0 && hasCorrectAnswer) {
            questions.push({
              id: sheetName,
              questionText: String(questionText),
              answers: shuffleArray(answers)
            });
          }
        }
        
        resolve(questions);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
