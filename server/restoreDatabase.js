import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.db');
const inputPath = process.argv[2];

if (!inputPath) {
  console.error('Usage: node server/restoreDatabase.js <backup-file-path>');
  process.exit(1);
}

const resolvedInput = path.isAbsolute(inputPath) ? inputPath : path.join(process.cwd(), inputPath);

if (!fs.existsSync(resolvedInput)) {
  console.error(`Backup file not found: ${resolvedInput}`);
  process.exit(1);
}

const walPath = `${dbPath}-wal`;
const shmPath = `${dbPath}-shm`;

if (fs.existsSync(walPath)) fs.rmSync(walPath, { force: true });
if (fs.existsSync(shmPath)) fs.rmSync(shmPath, { force: true });

fs.copyFileSync(resolvedInput, dbPath);
console.log(`Database restored from ${resolvedInput}`);

