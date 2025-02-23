
import { createWriteStream } from 'fs';
import { db } from '../db';
import { problems } from '../db/schema';

async function exportProblems() {
  const allProblems = await db.select().from(problems);
  
  const writer = createWriteStream('scripts/amc_problems_exported.csv');
  
  // Write header
  writer.write('year,competition_type,problem_number,question_html,solution_html,answer\n');
  
  // Write each problem
  for (const problem of allProblems) {
    const row = [
      problem.year,
      problem.competitionType,
      problem.problemNumber,
      problem.questionHtml?.replace(/"/g, '""') || '',  // Escape quotes for CSV
      problem.solutionHtml?.replace(/"/g, '""') || '',
      problem.answer
    ].map(field => `"${field}"`).join(',');
    
    writer.write(row + '\n');
  }
  
  writer.end();
  console.log('Export complete: scripts/amc_problems_exported.csv');
  process.exit(0);
}

exportProblems();
