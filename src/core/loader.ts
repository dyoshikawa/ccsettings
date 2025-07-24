import { promises as fs } from 'node:fs';
import type { Template } from '../types/index.js';
import { TemplateSchema } from '../schemas/index.js';
import { getBuiltinTemplate } from '../templates/builtin.js';

export async function loadTemplateFromFile(filePath: string): Promise<Template> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    return TemplateSchema.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Template file not found: ${filePath}`);
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in template file: ${filePath}`);
    }
    throw error;
  }
}

function convertGitHubUrl(url: string): string {
  // Convert GitHub blob URLs to raw URLs
  // From: https://github.com/user/repo/blob/branch/path/file.json
  // To: https://raw.githubusercontent.com/user/repo/branch/path/file.json
  const githubBlobRegex = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/(.+)$/;
  const match = url.match(githubBlobRegex);
  
  if (match) {
    const [, user, repo, pathWithBranch] = match;
    return `https://raw.githubusercontent.com/${user}/${repo}/${pathWithBranch}`;
  }
  
  return url;
}

export async function loadTemplateFromUrl(url: string): Promise<Template> {
  try {
    const rawUrl = convertGitHubUrl(url);
    const response = await fetch(rawUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch template from URL: ${response.status} ${response.statusText}`);
    }
    
    const content = await response.text();
    const data = JSON.parse(content);
    return TemplateSchema.parse(data);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error while fetching template from URL: ${url}`);
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in template from URL: ${url}`);
    }
    throw error;
  }
}

export async function loadTemplate(
  templateName?: string,
  filePath?: string,
  url?: string
): Promise<Template> {
  // Priority: URL > File > Template name > Default
  if (url) {
    return loadTemplateFromUrl(url);
  }
  
  if (filePath) {
    return loadTemplateFromFile(filePath);
  }
  
  const name = templateName || 'default';
  const template = getBuiltinTemplate(name);
  
  if (!template) {
    throw new Error(`Built-in template not found: ${name}`);
  }
  
  return template;
}