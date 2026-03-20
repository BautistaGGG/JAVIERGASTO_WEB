import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.db');
const backupDir = path.join(__dirname, 'backups');
const retentionDays = Number(process.env.BACKUP_RETENTION_DAYS || 14);

const timestamp = new Date()
  .toISOString()
  .replace(/[-:]/g, '')
  .replace(/\..+/, '')
  .replace('T', '_');

const backupName = `database_${timestamp}.db`;
const backupPath = path.join(backupDir, backupName);

if (!fs.existsSync(dbPath)) {
  console.error(`Database not found at ${dbPath}`);
  process.exit(1);
}

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

fs.copyFileSync(dbPath, backupPath);
console.log(`Backup created: ${backupPath}`);

const retentionMs = Math.max(1, retentionDays) * 24 * 60 * 60 * 1000;
const cutoff = Date.now() - retentionMs;
let prunedCount = 0;

for (const file of fs.readdirSync(backupDir)) {
  const filePath = path.join(backupDir, file);
  if (!/^database_\d{8}_\d{6}\.db$/.test(file)) continue;

  const stats = fs.statSync(filePath);
  if (stats.mtimeMs < cutoff) {
    fs.rmSync(filePath, { force: true });
    prunedCount += 1;
  }
}

if (prunedCount > 0) {
  console.log(`Pruned ${prunedCount} backup(s) older than ${retentionDays} day(s)`);
}
