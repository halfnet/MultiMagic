//npx tsx scripts/backup_db.ts
import { db } from '../db';
import { writeFile } from 'fs/promises';
import { join } from 'path';

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = join(process.cwd(), 'backups');
  
  try {
    // Get all table data
    const tables = ['users', 'game_results', 'game_question_results', 'problems', 'amc_game_results', 'amc_game_question_results'];
    const backupData: Record<string, any> = {};
    
    for (const table of tables) {
      const result = await db.execute(sql`SELECT * FROM ${sql.identifier(table)}`);
      backupData[table] = result.rows;
    }

    // Create backup file
    await writeFile(
      join(backupDir, `backup-${timestamp}.json`),
      JSON.stringify(backupData, null, 2)
    );

    console.log(`Backup completed: backup-${timestamp}.json`);
  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }
}

backupDatabase();
