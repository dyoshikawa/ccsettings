import { promises as fs } from "node:fs";
import { TemplateSchema } from "../schemas/index.js";
import { getBuiltinTemplate } from "../templates/builtin.js";
import type { Template } from "../types/index.js";

export async function loadTemplateFromFile(filePath: string): Promise<Template> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(content);
    return TemplateSchema.parse(data);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
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
  const githubBlobRegex = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/;
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
      throw new Error(
        `Failed to fetch template from URL: ${response.status} ${response.statusText}`,
      );
    }

    const content = await response.text();
    const data = JSON.parse(content);
    return TemplateSchema.parse(data);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
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
  url?: string,
): Promise<Template> {
  // Priority: URL > File > Template name > Default
  if (url) {
    return loadTemplateFromUrl(url);
  }

  if (filePath) {
    return loadTemplateFromFile(filePath);
  }

  const name = templateName || "default";
  const template = getBuiltinTemplate(name);

  if (!template) {
    throw new Error(`Built-in template not found: ${name}`);
  }

  return template;
}

export async function loadTemplates(
  templateNames?: string | string[],
  filePaths?: string | string[],
  urls?: string | string[],
): Promise<Template[]> {
  const templates: Template[] = [];
  const errors: string[] = [];

  // Convert single values to arrays
  const templateArray = templateNames
    ? Array.isArray(templateNames)
      ? templateNames
      : [templateNames]
    : [];
  const fileArray = filePaths ? (Array.isArray(filePaths) ? filePaths : [filePaths]) : [];
  const urlArray = urls ? (Array.isArray(urls) ? urls : [urls]) : [];

  // Load templates in order: builtin templates first, then files, then URLs
  for (const templateName of templateArray) {
    try {
      const template = await loadTemplate(templateName);
      templates.push(template);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`Built-in template "${templateName}": ${message}`);
    }
  }

  for (const filePath of fileArray) {
    try {
      const template = await loadTemplateFromFile(filePath);
      templates.push(template);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`File "${filePath}": ${message}`);
    }
  }

  for (const url of urlArray) {
    try {
      const template = await loadTemplateFromUrl(url);
      templates.push(template);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`URL "${url}": ${message}`);
    }
  }

  // If no templates were specified, throw an error
  if (
    templates.length === 0 &&
    templateArray.length === 0 &&
    fileArray.length === 0 &&
    urlArray.length === 0
  ) {
    throw new Error(
      "No templates specified. Please specify at least one template using --template, --file, or --url option.",
    );
  }

  // If there are errors but some templates loaded successfully, warn but continue
  if (errors.length > 0 && templates.length > 0) {
    console.warn("⚠️  Some templates failed to load:");
    errors.forEach((error) => console.warn(`  - ${error}`));
  }

  // If all templates failed to load, throw an error
  if (templates.length === 0) {
    const errorMessage =
      errors.length > 0
        ? `Failed to load any templates:\n${errors.map((e) => `  - ${e}`).join("\n")}`
        : "No templates specified and default template is not available";
    throw new Error(errorMessage);
  }

  return templates;
}
