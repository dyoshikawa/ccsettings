import { isArray, isObject, mergeWith, union } from "lodash-es";
import type { ClaudeSettings } from "../types/index.js";

function customMerger(objValue: unknown, srcValue: unknown): unknown {
  // For arrays, merge and remove duplicates
  // objValue is from the first object (template), srcValue is from second object (existing)
  if (isArray(objValue) && isArray(srcValue)) {
    return union(objValue, srcValue);
  }

  // For objects, continue with deep merge
  if (isObject(objValue) && isObject(srcValue)) {
    return undefined; // Let lodash handle deep merging
  }

  // For primitive values, prefer existing (srcValue) over template (objValue)
  if (srcValue !== undefined) {
    return srcValue;
  }

  return objValue;
}

export function mergeSettings(
  existing: ClaudeSettings | null,
  template: ClaudeSettings,
): ClaudeSettings {
  if (!existing) {
    return template;
  }

  return mergeWith({}, template, existing, customMerger);
}

export function mergeMultipleTemplates(
  existing: ClaudeSettings | null,
  templates: ClaudeSettings[],
): ClaudeSettings {
  if (templates.length === 0) {
    return existing || {};
  }

  let result = existing;
  for (const template of templates) {
    result = mergeSettings(result, template);
  }
  
  return result!;
}

export function createMergePreview(
  existing: ClaudeSettings | null,
  template: ClaudeSettings,
): {
  merged: ClaudeSettings;
  changes: {
    added: string[];
    modified: string[];
    unchanged: string[];
  };
} {
  // Create deep copies to avoid mutation
  const templateCopy = JSON.parse(JSON.stringify(template));
  const existingCopy = existing ? JSON.parse(JSON.stringify(existing)) : null;

  const merged = mergeSettings(existingCopy, templateCopy);
  const changes: {
    added: string[];
    modified: string[];
    unchanged: string[];
  } = {
    added: [],
    modified: [],
    unchanged: [],
  };

  // Analyze changes in permissions.allow
  if (template.permissions?.allow || existing?.permissions?.allow) {
    const existingAllow = existing?.permissions?.allow || [];
    const templateAllow = template.permissions?.allow || [];
    const mergedAllow = merged.permissions?.allow || [];

    for (const rule of templateAllow) {
      if (!existingAllow.includes(rule)) {
        changes.added.push(`permissions.allow: ${rule}`);
      }
    }

    for (const rule of existingAllow) {
      if (mergedAllow.includes(rule)) {
        changes.unchanged.push(`permissions.allow: ${rule}`);
      }
    }
  }

  // Analyze changes in permissions.deny
  if (template.permissions?.deny || existing?.permissions?.deny) {
    const existingDeny = existing?.permissions?.deny || [];
    const templateDeny = template.permissions?.deny || [];

    for (const rule of templateDeny) {
      if (!existingDeny.includes(rule)) {
        changes.added.push(`permissions.deny: ${rule}`);
      }
    }

    for (const rule of existingDeny) {
      changes.unchanged.push(`permissions.deny: ${rule}`);
    }
  }

  // Check for primitive values
  if (template.permissions?.defaultMode) {
    if (existing?.permissions?.defaultMode) {
      if (template.permissions.defaultMode !== existing.permissions.defaultMode) {
        changes.unchanged.push(
          `permissions.defaultMode: ${existing.permissions.defaultMode} (kept existing)`,
        );
      } else {
        changes.unchanged.push(`permissions.defaultMode: ${existing.permissions.defaultMode}`);
      }
    } else {
      changes.added.push(`permissions.defaultMode: ${template.permissions.defaultMode}`);
    }
  } else if (existing?.permissions?.defaultMode) {
    changes.unchanged.push(`permissions.defaultMode: ${existing.permissions.defaultMode}`);
  }

  // Check environment variables
  if (template.env) {
    const existingEnv = existing?.env || {};
    for (const [key, value] of Object.entries(template.env)) {
      if (!(key in existingEnv)) {
        changes.added.push(`env.${key}: ${value}`);
      } else if (existingEnv[key] !== value) {
        changes.unchanged.push(`env.${key}: ${existingEnv[key]} (kept existing)`);
      } else {
        changes.unchanged.push(`env.${key}: ${existingEnv[key]}`);
      }
    }
  }

  // Check for existing env vars not in template
  if (existing?.env) {
    const templateEnv = template.env || {};
    for (const [key, value] of Object.entries(existing.env)) {
      if (!(key in templateEnv)) {
        changes.unchanged.push(`env.${key}: ${value}`);
      }
    }
  }

  return { merged, changes };
}

export function createMultipleMergePreview(
  existing: ClaudeSettings | null,
  templates: ClaudeSettings[],
  templateNames?: string[],
): {
  merged: ClaudeSettings;
  changes: {
    added: string[];
    modified: string[];
    unchanged: string[];
    templateSources: Map<string, string>; // key -> template name that introduced it
  };
} {
  if (templates.length === 0) {
    return {
      merged: existing || {},
      changes: { added: [], modified: [], unchanged: [], templateSources: new Map() }
    };
  }

  if (templates.length === 1) {
    const singlePreview = createMergePreview(existing, templates[0]!);
    return {
      ...singlePreview,
      changes: {
        ...singlePreview.changes,
        templateSources: new Map()
      }
    };
  }

  // For multiple templates, we need to track which template added what
  const templateSources = new Map<string, string>();
  const changes: {
    added: string[];
    modified: string[];
    unchanged: string[];
  } = {
    added: [],
    modified: [],
    unchanged: [],
  };

  let currentMerged = existing;
  
  for (let i = 0; i < templates.length; i++) {
    const template = templates[i]!;
    const templateName = templateNames?.[i] || `Template ${i + 1}`;
    
    const preview = createMergePreview(currentMerged, template);
    
    // Track additions from this template
    for (const addition of preview.changes.added) {
      if (!changes.added.includes(addition)) {
        changes.added.push(addition);
        templateSources.set(addition, templateName);
      }
    }
    
    // Track modifications 
    for (const modification of preview.changes.modified) {
      if (!changes.modified.includes(modification)) {
        changes.modified.push(modification);
        templateSources.set(modification, templateName);
      }
    }
    
    currentMerged = preview.merged;
  }

  // Collect final unchanged items
  const finalPreview = createMergePreview(existing, currentMerged!);
  changes.unchanged = finalPreview.changes.unchanged;

  return {
    merged: currentMerged!,
    changes: {
      ...changes,
      templateSources
    }
  };
}
