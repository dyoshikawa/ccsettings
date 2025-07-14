import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { Settings, Template } from '../types/index.js'
import { SettingsSchema, TemplateSchema } from '../types/index.js'

const SETTINGS_PATH = '.claude/settings.json'

/**
 * プロジェクトのルートディレクトリから設定ファイルを読み込む
 */
export async function readProjectSettings(
  projectPath: string = process.cwd(),
): Promise<Settings | null> {
  const settingsPath = join(projectPath, SETTINGS_PATH)

  try {
    await access(settingsPath)
    const content = await readFile(settingsPath, 'utf-8')
    const data = JSON.parse(content)
    return SettingsSchema.parse(data)
  } catch {
    return null
  }
}

/**
 * プロジェクトのルートディレクトリに設定ファイルを書き込む
 */
export async function writeProjectSettings(
  settings: Settings,
  projectPath: string = process.cwd(),
): Promise<void> {
  const settingsPath = join(projectPath, SETTINGS_PATH)
  const dir = dirname(settingsPath)

  // ディレクトリが存在しない場合は作成
  await mkdir(dir, { recursive: true })

  const content = JSON.stringify(settings, null, 2)
  await writeFile(settingsPath, content + '\n', 'utf-8')
}

/**
 * ファイルからテンプレートを読み込む
 */
export async function readTemplateFromFile(
  filePath: string,
): Promise<Template> {
  const content = await readFile(filePath, 'utf-8')
  const data = JSON.parse(content)
  return TemplateSchema.parse(data)
}

/**
 * URLからテンプレートを読み込む
 */
export async function readTemplateFromUrl(url: string): Promise<Template> {
  // HTTPSのみサポート
  if (!url.startsWith('https://')) {
    throw new Error('Only HTTPS URLs are supported')
  }

  // GitHubの通常URLを生ファイルURLに変換
  const rawUrl = convertGitHubUrl(url)

  const response = await fetch(rawUrl, {
    signal: AbortSignal.timeout(30000), // 30秒のタイムアウト
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch template: ${response.statusText}`)
  }

  const data = await response.json()
  return TemplateSchema.parse(data)
}

/**
 * GitHubの通常URLを生ファイルURLに変換
 */
function convertGitHubUrl(url: string): string {
  const githubPattern = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/
  const match = url.match(githubPattern)

  if (match) {
    const [, owner, repo, path] = match
    return `https://raw.githubusercontent.com/${owner}/${repo}/${path}`
  }

  return url
}

/**
 * 設定ファイルのバックアップを作成
 */
export async function backupSettings(
  projectPath: string = process.cwd(),
): Promise<string | null> {
  const settingsPath = join(projectPath, SETTINGS_PATH)

  try {
    await access(settingsPath)
    const backupPath = `${settingsPath}.backup-${new Date().toISOString().replace(/[:.]/g, '-')}`
    const content = await readFile(settingsPath, 'utf-8')
    await writeFile(backupPath, content, 'utf-8')
    return backupPath
  } catch {
    return null
  }
}
