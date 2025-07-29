import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import { loadTemplate, loadTemplateFromFile, loadTemplateFromUrl } from '../../src/core/loader.js';
import type { Template } from '../../src/types/index.js';

// Mock fs
vi.mock('node:fs', () => ({
  promises: {
    readFile: vi.fn(),
  },
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadTemplateFromFile', () => {
    it('should load valid template from file', async () => {
      const mockTemplate: Template = {
        name: 'test',
        description: 'Test template',
        settings: {
          permissions: {
            allow: ['Read(src/**)'],
            defaultMode: 'default',
          },
        },
      };

      (fs.readFile as any).mockResolvedValue(JSON.stringify(mockTemplate));

      const result = await loadTemplateFromFile('/path/to/template.json');
      expect(result).toEqual(mockTemplate);
      expect(fs.readFile).toHaveBeenCalledWith('/path/to/template.json', 'utf-8');
    });

    it('should throw error for non-existent file', async () => {
      const error = new Error('File not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      (fs.readFile as any).mockRejectedValue(error);

      await expect(loadTemplateFromFile('/path/to/missing.json'))
        .rejects.toThrow('Template file not found: /path/to/missing.json');
    });

    it('should throw error for invalid JSON', async () => {
      (fs.readFile as any).mockResolvedValue('invalid json');

      await expect(loadTemplateFromFile('/path/to/invalid.json'))
        .rejects.toThrow('Invalid JSON in template file: /path/to/invalid.json');
    });

    it('should throw error for invalid template schema', async () => {
      const invalidTemplate = {
        name: 'test',
        // missing description and settings
      };

      (fs.readFile as any).mockResolvedValue(JSON.stringify(invalidTemplate));

      await expect(loadTemplateFromFile('/path/to/invalid-schema.json'))
        .rejects.toThrow();
    });
  });

  describe('loadTemplateFromUrl', () => {
    it('should load template from URL', async () => {
      const mockTemplate: Template = {
        name: 'remote',
        description: 'Remote template',
        settings: {
          permissions: {
            allow: ['Read(src/**)'],
          },
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockTemplate)),
      });

      const result = await loadTemplateFromUrl('https://example.com/template.json');
      expect(result).toEqual(mockTemplate);
      expect(mockFetch).toHaveBeenCalledWith('https://example.com/template.json');
    });

    it('should convert GitHub blob URLs to raw URLs', async () => {
      const mockTemplate: Template = {
        name: 'github',
        description: 'GitHub template',
        settings: {
          permissions: {
            allow: ['Read(src/**)'],
          },
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockTemplate)),
      });

      const githubUrl = 'https://github.com/user/repo/blob/main/template.json';
      const expectedRawUrl = 'https://raw.githubusercontent.com/user/repo/main/template.json';

      await loadTemplateFromUrl(githubUrl);
      expect(mockFetch).toHaveBeenCalledWith(expectedRawUrl);
    });

    it('should throw error for failed fetch', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(loadTemplateFromUrl('https://example.com/missing.json'))
        .rejects.toThrow('Failed to fetch template from URL: 404 Not Found');
    });

    it('should throw error for network error', async () => {
      mockFetch.mockRejectedValue(new TypeError('fetch failed'));

      await expect(loadTemplateFromUrl('https://example.com/template.json'))
        .rejects.toThrow('Network error while fetching template from URL');
    });

    it('should throw error for invalid JSON from URL', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('invalid json'),
      });

      await expect(loadTemplateFromUrl('https://example.com/invalid.json'))
        .rejects.toThrow('Invalid JSON in template from URL');
    });
  });

  describe('loadTemplate', () => {
    it('should prioritize URL over file and template name', async () => {
      const mockTemplate: Template = {
        name: 'url-template',
        description: 'URL template',
        settings: {},
      };

      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockTemplate)),
      });

      const result = await loadTemplate(
        'casual',
        '/path/to/file.json',
        'https://example.com/template.json'
      );

      expect(result).toEqual(mockTemplate);
      expect(mockFetch).toHaveBeenCalled();
      expect(fs.readFile).not.toHaveBeenCalled();
    });

    it('should prioritize file over template name', async () => {
      const mockTemplate: Template = {
        name: 'file-template',
        description: 'File template',
        settings: {},
      };

      (fs.readFile as any).mockResolvedValue(JSON.stringify(mockTemplate));

      const result = await loadTemplate('casual', '/path/to/file.json');

      expect(result).toEqual(mockTemplate);
      expect(fs.readFile).toHaveBeenCalled();
    });

    it('should load builtin template by name', async () => {
      const result = await loadTemplate('casual');

      expect(result.name).toBe('casual');
      expect(result.description).toBe('Casual settings.');
    });

    it('should load casual template when casual is specified', async () => {
      const result = await loadTemplate('casual');

      expect(result.name).toBe('casual');
      expect(result.description).toBe('Casual settings.');
    });

    it('should throw error for unknown builtin template', async () => {
      await expect(loadTemplate('unknown'))
        .rejects.toThrow('Built-in template not found: unknown');
    });
  });
});