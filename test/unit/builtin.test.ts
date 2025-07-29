import { describe, it, expect } from 'vitest';
import { getBuiltinTemplate, listBuiltinTemplates, builtinTemplates } from '../../src/templates/builtin.js';

describe('builtin templates', () => {
  describe('getBuiltinTemplate', () => {
    it('should return casual template', () => {
      const template = getBuiltinTemplate('casual');
      expect(template).toBeDefined();
      expect(template?.name).toBe('casual');
      expect(template?.description).toBe('Casual settings.');
      expect(template?.settings.permissions?.defaultMode).toBe('acceptEdits');
    });

    it('should return strict template', () => {
      const template = getBuiltinTemplate('strict');
      expect(template).toBeDefined();
      expect(template?.name).toBe('strict');
      expect(template?.description).toBe('Strict settings.');
      expect(template?.settings.permissions?.defaultMode).toBe('acceptEdits');
    });

    it('should return node template', () => {
      const template = getBuiltinTemplate('node');
      expect(template).toBeDefined();
      expect(template?.name).toBe('node');
      expect(template?.description).toBe('Node.js development settings.');
      expect(template?.settings.permissions?.defaultMode).toBe('acceptEdits');
      expect(template?.settings.env?.BASH_DEFAULT_TIMEOUT_MS).toBe('300000');
      expect(template?.settings.env?.BASH_MAX_TIMEOUT_MS).toBe('1200000');
    });

    it('should return undefined for unknown template', () => {
      const template = getBuiltinTemplate('unknown');
      expect(template).toBeUndefined();
    });
  });

  describe('listBuiltinTemplates', () => {
    it('should return all builtin templates', () => {
      const templates = listBuiltinTemplates();
      expect(templates).toHaveLength(3);
      expect(templates.map(t => t.name)).toEqual(['casual', 'strict', 'node']);
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

    it('should have proper environment variables in casual templates', () => {
      const casualTemplate = getBuiltinTemplate('casual');
      expect(casualTemplate?.settings.env?.BASH_DEFAULT_TIMEOUT_MS).toBe('300000');
      expect(casualTemplate?.settings.env?.BASH_MAX_TIMEOUT_MS).toBe('1200000');

      const nodeTemplate = getBuiltinTemplate('node');
      expect(nodeTemplate?.settings.env?.BASH_DEFAULT_TIMEOUT_MS).toBe('300000');
      expect(nodeTemplate?.settings.env?.BASH_MAX_TIMEOUT_MS).toBe('1200000');
    });

    it('should have appropriate security restrictions in strict template', () => {
      const strictTemplate = getBuiltinTemplate('strict');
      expect(strictTemplate?.settings.permissions?.defaultMode).toBe('acceptEdits');
      expect(strictTemplate?.settings.permissions?.deny).toContain('Bash(rm -rf ~/)');
      expect(strictTemplate?.settings.permissions?.deny).toContain('Bash(rm -rf //**)');
      expect(strictTemplate?.settings.permissions?.deny).toContain('Bash(git remote add:*)');
      expect(strictTemplate?.settings.permissions?.deny).toContain('Bash(git remote set-url:*)');
    });

    it('should have appropriate permissions in casual template', () => {
      const casualTemplate = getBuiltinTemplate('casual');
      expect(casualTemplate?.settings.permissions?.allow).toContain('Bash(git:*)');
      expect(casualTemplate?.settings.permissions?.allow).toContain('Bash(gh:*)');
      expect(casualTemplate?.settings.permissions?.allow).toContain('Bash(touch:*)');
      expect(casualTemplate?.settings.permissions?.allow).toContain('Bash(mkdir:*)');
      expect(casualTemplate?.settings.permissions?.allow).toContain('Bash(rg:*)');
    });

    it('should have appropriate permissions in node template', () => {
      const nodeTemplate = getBuiltinTemplate('node');
      expect(nodeTemplate?.settings.permissions?.allow).toContain('Bash(npm:*)');
      expect(nodeTemplate?.settings.permissions?.allow).toContain('Bash(yarn:*)');
      expect(nodeTemplate?.settings.permissions?.allow).toContain('Bash(pnpm:*)');
      expect(nodeTemplate?.settings.permissions?.deny).toContain('Bash(npm publish:*)');
      expect(nodeTemplate?.settings.permissions?.deny).toContain('Bash(pnpm publish:*)');
      expect(nodeTemplate?.settings.permissions?.deny).toContain('Bash(yarn publish:*)');
    });
  });
});