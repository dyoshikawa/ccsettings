import { describe, it, expect } from 'vitest';
import { mergeSettings, createMergePreview } from '../../src/core/merger.js';
import type { ClaudeSettings } from '../../src/types/index.js';

describe('merger', () => {
  describe('mergeSettings', () => {
    it('should return template when existing is null', () => {
      const template: ClaudeSettings = {
        permissions: {
          allow: ['Read(src/**)', 'Edit(src/**)'],
          defaultMode: 'default',
        },
      };

      const result = mergeSettings(null, template);
      expect(result).toEqual(template);
    });

    it('should merge arrays and remove duplicates', () => {
      const existing: ClaudeSettings = {
        permissions: {
          allow: ['Read(src/**)', 'Bash(npm test)'],
        },
      };

      const template: ClaudeSettings = {
        permissions: {
          allow: ['Read(src/**)', 'Edit(src/**)'],
        },
      };

      const result = mergeSettings(existing, template);
      expect(result.permissions?.allow).toEqual([
        'Read(src/**)',
        'Edit(src/**)',
        'Bash(npm test)',
      ]);
    });

    it('should prefer existing primitive values', () => {
      const existing: ClaudeSettings = {
        permissions: {
          defaultMode: 'acceptEdits',
        },
        model: 'claude-3-sonnet',
      };

      const template: ClaudeSettings = {
        permissions: {
          defaultMode: 'default',
        },
        model: 'claude-3-haiku',
      };

      const result = mergeSettings(existing, template);
      expect(result.permissions?.defaultMode).toBe('acceptEdits');
      expect(result.model).toBe('claude-3-sonnet');
    });

    it('should deep merge objects', () => {
      const existing: ClaudeSettings = {
        permissions: {
          allow: ['Read(src/**)'],
          defaultMode: 'acceptEdits',
        },
        env: {
          NODE_ENV: 'production',
        },
      };

      const template: ClaudeSettings = {
        permissions: {
          deny: ['Bash(rm -rf *)'],
          defaultMode: 'default',
        },
        env: {
          NODE_ENV: 'development',
          DEBUG: 'true',
        },
      };

      const result = mergeSettings(existing, template);
      expect(result.permissions?.allow).toEqual(['Read(src/**)']);
      expect(result.permissions?.deny).toEqual(['Bash(rm -rf *)']);
      expect(result.permissions?.defaultMode).toBe('acceptEdits');
      expect(result.env?.NODE_ENV).toBe('production');
      expect(result.env?.DEBUG).toBe('true');
    });
  });

  describe('createMergePreview', () => {
    it('should identify added, modified, and unchanged items', () => {
      const existing: ClaudeSettings = {
        permissions: {
          allow: ['Read(src/**)'],
          defaultMode: 'acceptEdits',
        },
        env: {
          NODE_ENV: 'production',
        },
      };

      const template: ClaudeSettings = {
        permissions: {
          allow: ['Read(src/**)', 'Edit(src/**)'],
          deny: ['Bash(rm -rf *)'],
          defaultMode: 'default',
        },
        env: {
          NODE_ENV: 'development',
          DEBUG: 'true',
        },
      };

      const { merged, changes } = createMergePreview(existing, template);
      
      expect(changes.added).toContain('permissions.allow: Edit(src/**)');
      expect(changes.added).toContain('permissions.deny: Bash(rm -rf *)');
      expect(changes.added).toContain('env.DEBUG: true');

      expect(changes.unchanged).toContain('permissions.allow: Read(src/**)');
      expect(changes.unchanged).toContain('permissions.defaultMode: acceptEdits (kept existing)');
      expect(changes.unchanged).toContain('env.NODE_ENV: production (kept existing)');

      expect(merged.permissions?.allow).toEqual(['Read(src/**)', 'Edit(src/**)']);
      expect(merged.permissions?.defaultMode).toBe('acceptEdits');
      expect(merged.env?.NODE_ENV).toBe('production');
      expect(merged.env?.DEBUG).toBe('true');
    });

    it('should handle null existing settings', () => {
      const template: ClaudeSettings = {
        permissions: {
          allow: ['Read(src/**)'],
          defaultMode: 'default',
        },
      };

      const { merged, changes } = createMergePreview(null, template);

      expect(changes.added).toContain('permissions.allow: Read(src/**)');
      expect(changes.added).toContain('permissions.defaultMode: default');
      expect(changes.unchanged).toHaveLength(0);
      expect(changes.modified).toHaveLength(0);

      expect(merged).toEqual(template);
    });
  });
});