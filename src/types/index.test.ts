import { describe, expect, it } from 'vitest'
import { PermissionsSchema, SettingsSchema, TemplateSchema } from './index.js'

describe('PermissionsSchema', () => {
  it('should validate valid permissions', () => {
    const valid = {
      allow: ['Read(src/**)', 'Edit(src/**)'],
      deny: ['Bash(rm -rf *)'],
      defaultMode: 'default' as const,
    }

    const result = PermissionsSchema.parse(valid)
    expect(result).toEqual(valid)
  })

  it('should accept empty permissions', () => {
    const result = PermissionsSchema.parse({})
    expect(result).toEqual({})
  })

  it('should reject invalid defaultMode', () => {
    expect(() => {
      PermissionsSchema.parse({
        defaultMode: 'invalid',
      })
    }).toThrow()
  })
})

describe('SettingsSchema', () => {
  it('should validate valid settings', () => {
    const valid = {
      permissions: {
        allow: ['Read(**)'],
        defaultMode: 'acceptEdits' as const,
      },
    }

    const result = SettingsSchema.parse(valid)
    expect(result).toEqual(valid)
  })

  it('should accept empty settings', () => {
    const result = SettingsSchema.parse({})
    expect(result).toEqual({})
  })
})

describe('TemplateSchema', () => {
  it('should validate valid template', () => {
    const valid = {
      name: 'test-template',
      description: 'Test template',
      settings: {
        permissions: {
          allow: ['Read(**)'],
          deny: ['Bash(sudo:*)'],
          defaultMode: 'plan' as const,
        },
      },
    }

    const result = TemplateSchema.parse(valid)
    expect(result).toEqual(valid)
  })

  it('should require name and description', () => {
    expect(() => {
      TemplateSchema.parse({
        settings: {},
      })
    }).toThrow()

    expect(() => {
      TemplateSchema.parse({
        name: 'test',
        settings: {},
      })
    }).toThrow()
  })
})
