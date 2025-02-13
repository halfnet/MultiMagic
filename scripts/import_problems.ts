// use the following sytax to run this script in shell
//npx tsx scripts/import_problems.ts scripts/amc_problems_20250210.csv

import { parse } from 'csv-parse';
import { createReadStream } from 'fs';
import { db } from '../db';
import { problems } from '../db/schema';

async function importProblems(filepath: string) {
  const parser = parse({
    delimiter: ',',
    columns: true,
    skip_empty_lines: true
  });

  const records: any[] = [];
  
  createReadStream(filepath)
    .pipe(parser)
    .on('data', (data) => {
      records.push({
        year: parseInt(data.year),
        competitionType: data.competition_type,
        problemNumber: parseInt(data.problem_number),
        questionHtml: data.question_html,
        solutionHtml: data.solution_html,
        answer: data.answer
      });
    })
    .on('end', async () => {
      try {
        await db.insert(problems).values(records);
        console.log(`Successfully imported ${records.length} problems`);
      } catch (error) {
        console.error('Error importing data:', error);
      }
      process.exit(0);
    });
}

// Get filepath from command line argument
const filepath = process.argv[2];
if (!filepath) {
  console.error('Please provide the CSV file path');
  process.exit(1);
}

importProblems(filepath);
