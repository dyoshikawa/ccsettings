import { describe, expect, it } from 'vitest'
import {
  builtinTemplates,
  getBuiltinTemplate,
  listBuiltinTemplates,
} from './index.js'

describe('builtinTemplates', () => {
  it('should have all required templates', () => {
    expect(builtinTemplates).toHaveProperty('default')
    expect(builtinTemplates).toHaveProperty('strict')
    expect(builtinTemplates).toHaveProperty('development')
    expect(builtinTemplates).toHaveProperty('testing')
  })

  it('should have valid template structure', () => {
    Object.values(builtinTemplates).forEach((template) => {
      expect(template).toHaveProperty('name')
      expect(template).toHaveProperty('description')
      expect(template).toHaveProperty('settings')
      expect(template.settings).toHaveProperty('permissions')
    })
  })
})

describe('getBuiltinTemplate', () => {
  it('should return template for valid name', () => {
    const template = getBuiltinTemplate('default')
    expect(template).toBeDefined()
    expect(template?.name).toBe('default')
  })

  it('should return undefined for invalid name', () => {
    const template = getBuiltinTemplate('nonexistent')
    expect(template).toBeUndefined()
  })
})

describe('listBuiltinTemplates', () => {
  it('should return array of template info', () => {
    const templates = listBuiltinTemplates()

    expect(Array.isArray(templates)).toBe(true)
    expect(templates.length).toBe(4)

    templates.forEach((template) => {
      expect(template).toHaveProperty('name')
      expect(template).toHaveProperty('description')
      expect(typeof template.name).toBe('string')
      expect(typeof template.description).toBe('string')
    })
  })
})
