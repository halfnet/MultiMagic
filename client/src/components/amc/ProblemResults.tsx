// ProblemResults.tsx
import { Problem } from './types';

interface ProblemResultsProps {
  problems: Problem[];
  userAnswers: { [key: number]: string };
  onReview: (index: number) => void;
}

export function ProblemResults({ problems, userAnswers, onReview }: ProblemResultsProps) {
  return (
    <div className="space-y-4">
      {problems.map((problem, idx) => (
        <div
          key={problem.id}
          className="p-4 border rounded cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => onReview(idx)}
        >
          <p>
            Problem {idx + 1}:{' '}
            {userAnswers[idx] ? (
              userAnswers[idx] === problem.answer ? (
                <span className="text-green-600">Correct</span>
              ) : (
                <span className="text-red-600">Incorrect (Answer: {problem.answer})</span>
              )
            ) : (
              <span className="text-gray-600">Not answered (Answer: {problem.answer})</span>
            )}
          </p>
          <p className="text-sm text-gray-500 mt-1">Click to review</p>
        </div>
      ))}
    </div>
  );
}