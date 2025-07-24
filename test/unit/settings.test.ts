import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import {
  findClaudeDirectory,
  getSettingsPath,
  readSettings,
  writeSettings,
  createBackup,
} from '../../src/core/settings.js';
import type { ClaudeSettings } from '../../src/types/index.js';

// Mock fs and path
vi.mock('node:fs', () => ({
  promises: {
    access: vi.fn(),
    mkdir: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
    copyFile: vi.fn(),
  },
}));

describe('settings', () => {
  const originalCwd = process.cwd();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock process.cwd to return a consistent path
    vi.spyOn(process, 'cwd').mockReturnValue('/project');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.chdir(originalCwd);
  });

  describe('findClaudeDirectory', () => {
    it('should find .claude directory in current directory', async () => {
      (fs.access as any).mockResolvedValue(undefined);

      const result = await findClaudeDirectory();
      expect(result).toBe('/project/.claude');
      expect(fs.access).toHaveBeenCalledWith('/project/.claude');
    });

    it('should find .claude directory in parent directory', async () => {
      (fs.access as any)
        .mockRejectedValueOnce(new Error('Not found'))
        .mockResolvedValueOnce(undefined);

      vi.spyOn(process, 'cwd').mockReturnValue('/project/subdir');

      const result = await findClaudeDirectory();
      expect(result).toBe('/project/.claude');
    });

    it('should return null if no .claude directory found', async () => {
      (fs.access as any).mockRejectedValue(new Error('Not found'));

      const result = await findClaudeDirectory();
      expect(result).toBeNull();
    });
  });

  describe('getSettingsPath', () => {
    it('should return existing .claude directory path', async () => {
      (fs.access as any).mockResolvedValue(undefined);

      const result = await getSettingsPath();
      expect(result).toBe('/project/.claude/settings.json');
    });

    it('should create .claude directory if not found', async () => {
      (fs.access as any).mockRejectedValue(new Error('Not found'));
      (fs.mkdir as any).mockResolvedValue(undefined);

      const result = await getSettingsPath();
      expect(result).toBe('/project/.claude/settings.json');
      expect(fs.mkdir).toHaveBeenCalledWith('/project/.claude', { recursive: true });
    });
  });

  describe('readSettings', () => {
    it('should read and parse valid settings file', async () => {
      const mockSettings: ClaudeSettings = {
        permissions: {
          allow: ['Read(src/**)'],
          defaultMode: 'default',
        },
      };

      (fs.access as any).mockResolvedValue(undefined);
      (fs.readFile as any).mockResolvedValue(JSON.stringify(mockSettings));

      const result = await readSettings();
      expect(result).toEqual(mockSettings);
    });

    it('should return null for non-existent file', async () => {
      (fs.access as any).mockResolvedValue(undefined);
      const error = new Error('File not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      (fs.readFile as any).mockRejectedValue(error);

      const result = await readSettings();
      expect(result).toBeNull();
    });

    it('should throw error for invalid JSON', async () => {
      (fs.access as any).mockResolvedValue(undefined);
      (fs.readFile as any).mockResolvedValue('invalid json');

      await expect(readSettings()).rejects.toThrow();
    });

    it('should validate settings schema', async () => {
      const invalidSettings = {
        permissions: {
          defaultMode: 'invalid-mode', // Invalid enum value
        },
      };

      (fs.access as any).mockResolvedValue(undefined);
      (fs.readFile as any).mockResolvedValue(JSON.stringify(invalidSettings));

      await expect(readSettings()).rejects.toThrow();
    });
  });

  describe('writeSettings', () => {
    it('should write valid settings to file', async () => {
      const settings: ClaudeSettings = {
        permissions: {
          allow: ['Read(src/**)'],
          defaultMode: 'default',
        },
      };

      (fs.access as any).mockResolvedValue(undefined);
      (fs.writeFile as any).mockResolvedValue(undefined);

      await writeSettings(settings);

      expect(fs.writeFile).toHaveBeenCalledWith(
        '/project/.claude/settings.json',
        JSON.stringify(settings, null, 2),
        'utf-8'
      );
    });

    it('should validate settings before writing', async () => {
      const invalidSettings = {
        permissions: {
          defaultMode: 'invalid-mode' as any,
        },
      } as ClaudeSettings;

      (fs.access as any).mockResolvedValue(undefined);

      await expect(writeSettings(invalidSettings)).rejects.toThrow();
    });

    it('should create directory if needed', async () => {
      const settings: ClaudeSettings = {
        permissions: {
          allow: ['Read(src/**)'],
        },
      };

      (fs.access as any).mockRejectedValue(new Error('Not found'));
      (fs.mkdir as any).mockResolvedValue(undefined);
      (fs.writeFile as any).mockResolvedValue(undefined);

      await writeSettings(settings);

      expect(fs.mkdir).toHaveBeenCalledWith('/project/.claude', { recursive: true });
      expect(fs.writeFile).toHaveBeenCalled();
    });
  });

  describe('createBackup', () => {
    it('should create backup with timestamp', async () => {
      (fs.access as any).mockResolvedValue(undefined);
      (fs.copyFile as any).mockResolvedValue(undefined);

      // Mock Date to get consistent timestamp
      const mockDate = new Date('2024-01-01T12:00:00.000Z');
      vi.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const result = await createBackup();

      expect(result).toMatch(/\.claude\/settings\.backup-.*\.json$/);
      expect(fs.copyFile).toHaveBeenCalledWith(
        '/project/.claude/settings.json',
        expect.stringMatching(/\.claude\/settings\.backup-.*\.json$/)
      );
    });

    it('should throw error if source file does not exist', async () => {
      (fs.access as any).mockResolvedValue(undefined);
      const error = new Error('File not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      (fs.copyFile as any).mockRejectedValue(error);

      await expect(createBackup()).rejects.toThrow('No settings file exists to backup');
    });
  });
});