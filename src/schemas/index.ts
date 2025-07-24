import { z } from "zod/mini";

const PermissionsSchema = z.object({
  allow: z.optional(z.array(z.string())),
  deny: z.optional(z.array(z.string())),
  additionalDirectories: z.optional(z.array(z.string())),
  defaultMode: z.optional(z.enum(["default", "acceptEdits", "plan", "bypassPermissions"])),
  disableBypassPermissionsMode: z.optional(z.literal("disable")),
});

const ClaudeSettingsSchema = z.object({
  permissions: z.optional(PermissionsSchema),
  env: z.optional(z.record(z.string(), z.string())),
  includeCoAuthoredBy: z.optional(z.boolean()),
  cleanupPeriodDays: z.optional(z.number()),
  model: z.optional(z.string()),
  hooks: z.optional(z.record(z.string(), z.record(z.string(), z.string()))),
});

const TemplateSchema = z.object({
  name: z.string(),
  description: z.string(),
  settings: ClaudeSettingsSchema,
});

export { PermissionsSchema, ClaudeSettingsSchema, TemplateSchema };
