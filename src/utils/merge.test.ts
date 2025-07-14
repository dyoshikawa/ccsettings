import { describe, expect, it } from 'vitest'
import type { Settings } from '../types/index.js'
import { mergeSettings } from './merge.js'

describe('mergeSettings', () => {
  it('should merge permissions arrays without duplicates', () => {
    const existing: Settings = {
      permissions: {
        allow: ['Read(src/**)'],
        deny: ['Bash(rm -rf *)'],
      },
    }

    const template: Settings = {
      permissions: {
        allow: ['Read(src/**)', 'Bash(npm run test:*)'],
        deny: ['Bash(rm -rf *)', 'Bash(curl:*)'],
      },
    }

    const result = mergeSettings(existing, template)

    expect(result.permissions?.allow).toEqual([
      'Read(src/**)',
      'Bash(npm run test:*)',
    ])

    expect(result.permissions?.deny).toEqual(['Bash(rm -rf *)', 'Bash(curl:*)'])
  })

  it('should prioritize existing defaultMode over template', () => {
    const existing: Settings = {
      permissions: {
        defaultMode: 'acceptEdits',
      },
    }

    const template: Settings = {
      permissions: {
        defaultMode: 'default',
      },
    }

    const result = mergeSettings(existing, template)

    expect(result.permissions?.defaultMode).toBe('acceptEdits')
  })

  it('should use template values when existing is empty', () => {
    const existing: Settings = {}

    const template: Settings = {
      permissions: {
        allow: ['Read(**)', 'Edit(**)'],
        deny: ['Bash(sudo:*)'],
        defaultMode: 'plan',
      },
    }

    const result = mergeSettings(existing, template)

    expect(result).toEqual(template)
  })

  it('should handle undefined permissions properly', () => {
    const existing: Settings = {
      permissions: {
        allow: ['Read(src/**)'],
      },
    }

    const template: Settings = {
      permissions: {
        deny: ['Bash(rm -rf *)'],
      },
    }

    const result = mergeSettings(existing, template)

    expect(result.permissions?.allow).toEqual(['Read(src/**)'])
    expect(result.permissions?.deny).toEqual(['Bash(rm -rf *)'])
  })
})
