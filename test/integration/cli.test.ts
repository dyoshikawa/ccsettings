import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

describe('CLI Integration Tests', () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    originalCwd = process.cwd();
    tempDir = await fs.mkdtemp(join(tmpdir(), 'ccsettings-test-'));
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('list command', () => {
    it('should list all builtin templates', async () => {
      const { stdout } = await execFileAsync('tsx', [
        join(originalCwd, 'src/cli/index.ts'),
        'list'
      ]);

      expect(stdout).toContain('Available builtin templates');
      expect(stdout).toContain('casual');
      expect(stdout).toContain('strict');
      expect(stdout).toContain('node');
      expect(stdout).toContain('Casual settings.');
      expect(stdout).toContain('Strict settings.');
    });
  });

  describe('show command', () => {
    it('should show message when no settings file exists', async () => {
      const { stdout } = await execFileAsync('tsx', [
        join(originalCwd, 'src/cli/index.ts'),
        'show'
      ]);

      expect(stdout).toContain('Settings file not found');
      expect(stdout).toContain('ccsettings apply --template casual');
    });

    it('should show existing settings', async () => {
      // Create a settings file
      const claudeDir = join(tempDir, '.claude');
      await fs.mkdir(claudeDir, { recursive: true });
      
      const settings = {
        permissions: {
          allow: ['Read(src/**)'],
          deny: ['Bash(rm -rf *)'],
          defaultMode: 'acceptEdits'
        },
        env: {
          NODE_ENV: 'development'
        }
      };
      
      await fs.writeFile(
        join(claudeDir, 'settings.json'),
        JSON.stringify(settings, null, 2)
      );

      const { stdout } = await execFileAsync('tsx', [
        join(originalCwd, 'src/cli/index.ts'),
        'show'
      ]);

      expect(stdout).toContain('Current Claude Code settings');
      expect(stdout).toContain('Permission settings');
      expect(stdout).toContain('acceptEdits');
      expect(stdout).toContain('Read(src/**)');
      expect(stdout).toContain('Bash(rm -rf *)');
      expect(stdout).toContain('Environment variables');
      expect(stdout).toContain('NODE_ENV: development');
    });
  });

  describe('apply command', () => {
    it('should apply template with dry-run', async () => {
      const { stdout } = await execFileAsync('tsx', [
        join(originalCwd, 'src/cli/index.ts'),
        'apply',
        '--template',
        'casual',
        '--dry-run'
      ]);

      expect(stdout).toContain('Loaded template "casual"');
      expect(stdout).toContain('Planned changes');
      expect(stdout).toContain('Settings to be added');
      expect(stdout).toContain('Dry-run mode');
    });

    it('should apply template with force flag', async () => {
      const { stdout } = await execFileAsync('tsx', [
        join(originalCwd, 'src/cli/index.ts'),
        'apply',
        '--template',
        'casual',
        '--force'
      ]);

      expect(stdout).toContain('Settings applied successfully');

      // Verify settings file was created
      const settingsPath = join(tempDir, '.claude', 'settings.json');
      const settingsContent = await fs.readFile(settingsPath, 'utf-8');
      const settings = JSON.parse(settingsContent);
      
      expect(settings.permissions).toBeDefined();
      expect(settings.permissions.defaultMode).toBe('acceptEdits');
      expect(settings.permissions.allow).toContain('Read(**)');
    });

    it('should merge with existing settings', async () => {
      // Create existing settings
      const claudeDir = join(tempDir, '.claude');
      await fs.mkdir(claudeDir, { recursive: true });
      
      const existingSettings = {
        permissions: {
          allow: ['Read(existing/**)'],
          defaultMode: 'acceptEdits'
        },
        model: 'claude-3-sonnet'
      };
      
      await fs.writeFile(
        join(claudeDir, 'settings.json'),
        JSON.stringify(existingSettings, null, 2)
      );

      const { stdout } = await execFileAsync('tsx', [
        join(originalCwd, 'src/cli/index.ts'),
        'apply',
        '--template',
        'node',
        '--force'
      ]);

      expect(stdout).toContain('Settings applied successfully');

      // Verify merged settings
      const settingsContent = await fs.readFile(join(claudeDir, 'settings.json'), 'utf-8');
      const settings = JSON.parse(settingsContent);
      
      // Should preserve existing values
      expect(settings.permissions.defaultMode).toBe('acceptEdits');
      expect(settings.model).toBe('claude-3-sonnet');
      
      // Should add new values
      expect(settings.permissions.allow).toContain('Read(existing/**)');
      expect(settings.permissions.allow).toContain('Bash(npm:*)');
      expect(settings.env.BASH_DEFAULT_TIMEOUT_MS).toBe('300000');
    });

    it('should create backup when requested', async () => {
      // Create existing settings
      const claudeDir = join(tempDir, '.claude');
      await fs.mkdir(claudeDir, { recursive: true });
      
      const existingSettings = {
        permissions: {
          allow: ['Read(src/**)'],
        }
      };
      
      await fs.writeFile(
        join(claudeDir, 'settings.json'),
        JSON.stringify(existingSettings, null, 2)
      );

      const { stdout } = await execFileAsync('tsx', [
        join(originalCwd, 'src/cli/index.ts'),
        'apply',
        '--template',
        'casual',
        '--backup',
        '--force'
      ]);

      expect(stdout).toContain('Backup created');
      expect(stdout).toContain('Settings applied successfully');

      // Verify backup file exists
      const files = await fs.readdir(claudeDir);
      const backupFiles = files.filter(file => file.startsWith('settings.backup-'));
      expect(backupFiles).toHaveLength(1);
    });
  });

  describe('multiple templates', () => {
    it('should apply multiple builtin templates', async () => {
      const { stdout } = await execFileAsync('tsx', [
        join(originalCwd, 'src/cli/index.ts'),
        'apply',
        '--template',
        'casual',
        '--template',
        'node',
        '--dry-run'
      ]);

      expect(stdout).toContain('Loaded 2 templates:');
      expect(stdout).toContain('casual');
      expect(stdout).toContain('node');
      expect(stdout).toContain('Dry-run mode');
    });

    it('should apply multiple templates with source tracking', async () => {
      const { stdout } = await execFileAsync('tsx', [
        join(originalCwd, 'src/cli/index.ts'),
        'apply',
        '--template',
        'strict',
        '--template',
        'node',
        '--dry-run'
      ]);

      expect(stdout).toContain('Loaded 2 templates:');
      expect(stdout).toContain('[from: strict]');
      expect(stdout).toContain('[from: node]');
    });

    it('should handle mixed template sources', async () => {
      // Create a custom template file
      const customTemplate = {
        name: 'custom',
        description: 'Custom test template',
        settings: {
          permissions: {
            allow: ['Read(custom/**)'],
            deny: ['Write(custom/**)']
          },
          env: {
            CUSTOM_VAR: 'test'
          }
        }
      };

      await fs.writeFile(
        join(tempDir, 'custom-template.json'),
        JSON.stringify(customTemplate, null, 2)
      );

      const { stdout } = await execFileAsync('tsx', [
        join(originalCwd, 'src/cli/index.ts'),
        'apply',
        '--template',
        'casual',
        '--file',
        join(tempDir, 'custom-template.json'),
        '--dry-run'
      ]);

      expect(stdout).toContain('Loaded 2 templates:');
      expect(stdout).toContain('casual');
      expect(stdout).toContain('custom');
      expect(stdout).toContain('env.CUSTOM_VAR: test');
    });
  });

  describe('error handling', () => {
    it('should handle invalid template name', async () => {
      await expect(
        execFileAsync('tsx', [
          join(originalCwd, 'src/cli/index.ts'),
          'apply',
          '--template',
          'nonexistent'
        ])
      ).rejects.toThrow();
    });

    it('should handle invalid file path', async () => {
      await expect(
        execFileAsync('tsx', [
          join(originalCwd, 'src/cli/index.ts'),
          'apply',
          '--file',
          '/nonexistent/path.json'
        ])
      ).rejects.toThrow();
    });

    it('should handle invalid URL', async () => {
      await expect(
        execFileAsync('tsx', [
          join(originalCwd, 'src/cli/index.ts'),
          'apply',
          '--url',
          'https://nonexistent.example.com/template.json'
        ])
      ).rejects.toThrow();
    });
  });
});