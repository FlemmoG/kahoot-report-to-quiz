# kahoot_to_quiz

A small, minimal Next.js app that converts Kahoot export files into a simple quiz format.

Usage
- Visit https://kahoot-report-to-quiz.vercel.app
- Or run locally:
	- Install dependencies: `npm install`
	- Run development server: `npm run dev`
	- Open http://localhost:3000 in your browser


What it does
- Upload a Kahoot export (xlsx) and parse it into quiz questions.
- Preview the parsed questions and run a lightweight quiz player.

Key files
- `src/lib/kahootParser.ts` — parser for Kahoot exports
- `src/components/FileUpload.tsx` — file upload / parsing UI
- `src/components/QuizPlayer.tsx` — simple quiz player and results view

Tech
- Next.js, TypeScript, React

Notes
- Minimal personal project; no special deployment steps beyond a standard Next.js app.

