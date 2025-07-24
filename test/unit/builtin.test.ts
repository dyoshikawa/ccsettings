import { describe, it, expect } from 'vitest';
import { getBuiltinTemplate, listBuiltinTemplates, builtinTemplates } from '../../src/templates/builtin.js';

describe('builtin templates', () => {
  describe('getBuiltinTemplate', () => {
    it('should return default template', () => {
      const template = getBuiltinTemplate('default');
      expect(template).toBeDefined();
      expect(template?.name).toBe('default');
      expect(template?.description).toBe('基本的な権限設定');
      expect(template?.settings.permissions?.defaultMode).toBe('default');
    });

    it('should return strict template', () => {
      const template = getBuiltinTemplate('strict');
      expect(template).toBeDefined();
      expect(template?.name).toBe('strict');
      expect(template?.description).toBe('厳格なセキュリティ設定');
      expect(template?.settings.permissions?.defaultMode).toBe('plan');
    });

    it('should return development template', () => {
      const template = getBuiltinTemplate('development');
      expect(template).toBeDefined();
      expect(template?.name).toBe('development');
      expect(template?.description).toBe('開発環境向けの緩い設定');
      expect(template?.settings.permissions?.defaultMode).toBe('acceptEdits');
      expect(template?.settings.env?.NODE_ENV).toBe('development');
    });

    it('should return testing template', () => {
      const template = getBuiltinTemplate('testing');
      expect(template).toBeDefined();
      expect(template?.name).toBe('testing');
      expect(template?.description).toBe('テスト実行に特化した設定');
      expect(template?.settings.permissions?.defaultMode).toBe('acceptEdits');
      expect(template?.settings.env?.NODE_ENV).toBe('test');
    });

    it('should return undefined for unknown template', () => {
      const template = getBuiltinTemplate('unknown');
      expect(template).toBeUndefined();
    });
  });

  describe('listBuiltinTemplates', () => {
    it('should return all builtin templates', () => {
      const templates = listBuiltinTemplates();
      expect(templates).toHaveLength(4);
      expect(templates.map(t => t.name)).toEqual(['default', 'strict', 'development', 'testing']);
    });

    it('should return templates with all required fields', () => {
      const templates = listBuiltinTemplates();
      templates.forEach(template => {
        expect(template.name).toBeDefined();
        expect(template.description).toBeDefined();
        expect(template.settings).toBeDefined();
      });
    });
  });

  describe('template structure validation', () => {
    it('should have consistent structure across all templates', () => {
      Object.values(builtinTemplates).forEach(template => {
        expect(template.name).toBeDefined();
        expect(template.description).toBeDefined();
        expect(template.settings).toBeDefined();
        expect(template.settings.permissions).toBeDefined();
      });
    });

    it('should have valid defaultMode values', () => {
      const validModes = ['default', 'acceptEdits', 'plan', 'bypassPermissions'];
      Object.values(builtinTemplates).forEach(template => {
        const mode = template.settings.permissions?.defaultMode;
        if (mode) {
          expect(validModes).toContain(mode);
        }
      });
    });

    it('should have allow and deny arrays when defined', () => {
      Object.values(builtinTemplates).forEach(template => {
        const permissions = template.settings.permissions;
        if (permissions?.allow) {
          expect(Array.isArray(permissions.allow)).toBe(true);
          expect(permissions.allow.length).toBeGreaterThan(0);
        }
        if (permissions?.deny) {
          expect(Array.isArray(permissions.deny)).toBe(true);
          expect(permissions.deny.length).toBeGreaterThan(0);
        }
      });
    });

    it('should have proper environment variables in development and testing templates', () => {
      const devTemplate = getBuiltinTemplate('development');
      expect(devTemplate?.settings.env?.NODE_ENV).toBe('development');

      const testTemplate = getBuiltinTemplate('testing');
      expect(testTemplate?.settings.env?.NODE_ENV).toBe('test');
    });

    it('should have appropriate security restrictions in strict template', () => {
      const strictTemplate = getBuiltinTemplate('strict');
      expect(strictTemplate?.settings.permissions?.defaultMode).toBe('plan');
      expect(strictTemplate?.settings.permissions?.deny).toContain('Bash(*)');
      expect(strictTemplate?.settings.permissions?.deny).toContain('WebFetch(*)');
      expect(strictTemplate?.settings.permissions?.deny).toContain('Write(*)');
      expect(strictTemplate?.settings.permissions?.deny).toContain('Edit(*)');
    });
  });
});