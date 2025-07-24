import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import type { ClaudeSettings } from '../types/index.js';
import { ClaudeSettingsSchema } from '../schemas/index.js';

const SETTINGS_DIR = '.claude';
const SETTINGS_FILE = 'settings.json';

export async function findClaudeDirectory(): Promise<string | null> {
  let currentDir = process.cwd();
  
  while (currentDir !== '/') {
    const claudeDir = join(currentDir, SETTINGS_DIR);
    try {
      await fs.access(claudeDir);
      return claudeDir;
    } catch {
      // Directory doesn't exist, continue searching
    }
    
    const parentDir = join(currentDir, '..');
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }
  
  return null;
}

export async function getSettingsPath(): Promise<string> {
  const claudeDir = await findClaudeDirectory();
  
  if (!claudeDir) {
    // If no .claude directory found, create one in current directory
    const currentClaudeDir = join(process.cwd(), SETTINGS_DIR);
    await fs.mkdir(currentClaudeDir, { recursive: true });
    return join(currentClaudeDir, SETTINGS_FILE);
  }
  
  return join(claudeDir, SETTINGS_FILE);
}

export async function readSettings(): Promise<ClaudeSettings | null> {
  try {
    const settingsPath = await getSettingsPath();
    const content = await fs.readFile(settingsPath, 'utf-8');
    const data = JSON.parse(content);
    return ClaudeSettingsSchema.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null; // File doesn't exist
    }
    throw error;
  }
}

export async function writeSettings(settings: ClaudeSettings): Promise<void> {
  const settingsPath = await getSettingsPath();
  const validated = ClaudeSettingsSchema.parse(settings);
  await fs.writeFile(settingsPath, JSON.stringify(validated, null, 2), 'utf-8');
}

export async function createBackup(): Promise<string> {
  const settingsPath = await getSettingsPath();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = settingsPath.replace('.json', `.backup-${timestamp}.json`);
  
  try {
    await fs.copyFile(settingsPath, backupPath);
    return backupPath;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error('No settings file exists to backup');
    }
    throw error;
  }
}