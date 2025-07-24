export interface ClaudeSettings {
  permissions?: {
    allow?: string[];
    deny?: string[];
    additionalDirectories?: string[];
    defaultMode?: 'default' | 'acceptEdits' | 'plan' | 'bypassPermissions';
    disableBypassPermissionsMode?: 'disable';
  };
  env?: Record<string, string>;
  includeCoAuthoredBy?: boolean;
  cleanupPeriodDays?: number;
  model?: string;
  hooks?: Record<string, Record<string, string>>;
  [key: string]: unknown;
}

export interface Template {
  name: string;
  description: string;
  settings: ClaudeSettings;
}

export interface ApplyOptions {
  template?: string;
  file?: string;
  url?: string;
  dryRun?: boolean;
  backup?: boolean;
  force?: boolean;
}

export interface TemplateSource {
  type: 'builtin' | 'file' | 'url';
  value: string;
}