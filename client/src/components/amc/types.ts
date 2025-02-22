// types.ts
export interface Problem {
  id: number;
  year: number;
  competition_type: string;
  problem_number: number;
  question_html: string;
  answer: string;
}