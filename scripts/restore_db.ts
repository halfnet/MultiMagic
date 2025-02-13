
//npx tsx scripts/restore_db.ts backups/backup-filename.json
import { db } from '../db';
import { readFile } from 'fs/promises';
import { sql } from 'drizzle-orm';

async function restoreDatabase(filepath: string) {
  try {
    const backupData = JSON.parse(await readFile(filepath, 'utf-8'));
    const tables = Object.keys(backupData);

    for (const table of tables) {
      if (backupData[table].length > 0) {
        // Clear existing data
        await db.execute(sql`TRUNCATE TABLE ${sql.identifier(table)} CASCADE`);
        
        // Restore data
        const columns = Object.keys(backupData[table][0]);
        const values = backupData[table].map((row: any) => 
          columns.map(col => row[col])
        );
        
        if (values.length > 0) {
          const placeholders = values.map(
            (_, i) => `(${columns.map((_, j) => `$${i * columns.length + j + 1}`).join(', ')})`
          ).join(', ');
          
          const query = `INSERT INTO ${table} (${columns.map(c => `"${c}"`).join(', ')}) VALUES ${placeholders}`;
          await db.execute(sql.raw(query), values.flat());
        }
      }
    }

    console.log('Database restore completed successfully');
  } catch (error) {
    console.error('Restore failed:', error);
    process.exit(1);
  }
}

// Get filepath from command line argument
const filepath = process.argv[2];
if (!filepath) {
  console.error('Please provide the backup file path');
  process.exit(1);
}

restoreDatabase(filepath);
