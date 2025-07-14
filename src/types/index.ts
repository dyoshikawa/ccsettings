import { z } from 'zod'

export const PermissionsSchema = z.object({
  allow: z.optional(z.array(z.string())),
  deny: z.optional(z.array(z.string())),
  defaultMode: z.optional(
    z.enum(['default', 'acceptEdits', 'plan', 'bypassPermissions']),
  ),
})

export const SettingsSchema = z.object({
  permissions: z.optional(PermissionsSchema),
})

export const TemplateSchema = z.object({
  name: z.string(),
  description: z.string(),
  settings: SettingsSchema,
})

export type Permissions = z.infer<typeof PermissionsSchema>
export type Settings = z.infer<typeof SettingsSchema>
export type Template = z.infer<typeof TemplateSchema>
