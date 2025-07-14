import type { Template } from '../types/index.js'

export const builtinTemplates: Record<string, Template> = {
  default: {
    name: 'default',
    description: '基本的な権限設定',
    settings: {
      permissions: {
        allow: [
          'Read(src/**)',
          'Edit(src/**)',
          'Bash(npm run test:*)',
          'Bash(npm run build)',
          'Bash(npm run lint)',
          'Bash(npm run format)',
        ],
        deny: [
          'Bash(rm -rf *)',
          'Bash(curl:*)',
          'Edit(package-lock.json)',
          'Edit(.env*)',
        ],
        defaultMode: 'default',
      },
    },
  },
  strict: {
    name: 'strict',
    description: '厳格なセキュリティ設定',
    settings: {
      permissions: {
        allow: ['Read(src/**)', 'Edit(src/**)'],
        deny: [
          'Bash(*)',
          'WebFetch(*)',
          'Edit(package.json)',
          'Edit(package-lock.json)',
          'Edit(.*)',
          'Edit(**/*.env*)',
        ],
        defaultMode: 'plan',
      },
    },
  },
  development: {
    name: 'development',
    description: '開発環境向けの緩い設定',
    settings: {
      permissions: {
        allow: [
          'Read(**)',
          'Edit(**)',
          'Bash(npm:*)',
          'Bash(pnpm:*)',
          'Bash(yarn:*)',
          'Bash(git:*)',
          'WebFetch(domain:localhost)',
          'WebFetch(domain:127.0.0.1)',
        ],
        deny: ['Bash(rm -rf /)', 'Bash(sudo:*)'],
        defaultMode: 'acceptEdits',
      },
    },
  },
  testing: {
    name: 'testing',
    description: 'テスト実行に特化した設定',
    settings: {
      permissions: {
        allow: [
          'Read(**)',
          'Edit(src/**)',
          'Edit(test/**)',
          'Edit(tests/**)',
          'Edit(__tests__/**)',
          'Bash(npm test*)',
          'Bash(npm run test*)',
          'Bash(pnpm test*)',
          'Bash(yarn test*)',
          'Bash(jest*)',
          'Bash(vitest*)',
          'Bash(pytest*)',
        ],
        deny: ['Edit(node_modules/**)', 'Edit(.git/**)', 'Bash(rm -rf *)'],
        defaultMode: 'acceptEdits',
      },
    },
  },
}

export function getBuiltinTemplate(name: string): Template | undefined {
  return builtinTemplates[name]
}

export function listBuiltinTemplates(): Array<{
  name: string
  description: string
}> {
  return Object.values(builtinTemplates).map(({ name, description }) => ({
    name,
    description,
  }))
}
