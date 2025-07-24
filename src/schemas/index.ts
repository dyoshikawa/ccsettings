import { z } from 'zod';

const PermissionsSchema = z.object({
  allow: z.array(z.string()).optional(),
  deny: z.array(z.string()).optional(),
  additionalDirectories: z.array(z.string()).optional(),
  defaultMode: z.enum(['default', 'acceptEdits', 'plan', 'bypassPermissions']).optional(),
  disableBypassPermissionsMode: z.literal('disable').optional(),
});

const ClaudeSettingsSchema = z.object({
  permissions: PermissionsSchema.optional(),
  env: z.record(z.string()).optional(),
  includeCoAuthoredBy: z.boolean().optional(),
  cleanupPeriodDays: z.number().optional(),
  model: z.string().optional(),
  hooks: z.record(z.record(z.string())).optional(),
});

const TemplateSchema = z.object({
  name: z.string(),
  description: z.string(),
  settings: ClaudeSettingsSchema,
});

export { PermissionsSchema, ClaudeSettingsSchema, TemplateSchema };