import { merge, uniq } from 'lodash-es'
import type { Settings } from '../types/index.js'

/**
 * 設定をマージする関数
 * 既存設定を優先しながら、テンプレート設定をマージする
 */
export function mergeSettings(
  existing: Settings,
  template: Settings,
): Settings {
  // 深いコピーを作成
  const result = merge({}, template)

  // 手動でマージ処理を行う
  if (existing.permissions) {
    if (!result.permissions) {
      result.permissions = {}
    }

    // 配列のマージ（重複を除く）
    if (existing.permissions.allow || template.permissions?.allow) {
      const existingAllow = existing.permissions.allow || []
      const templateAllow = template.permissions?.allow || []
      result.permissions.allow = uniq([...existingAllow, ...templateAllow])
    }

    if (existing.permissions.deny || template.permissions?.deny) {
      const existingDeny = existing.permissions.deny || []
      const templateDeny = template.permissions?.deny || []
      result.permissions.deny = uniq([...existingDeny, ...templateDeny])
    }

    // プリミティブ値は既存設定を優先
    if (existing.permissions.defaultMode !== undefined) {
      result.permissions.defaultMode = existing.permissions.defaultMode
    }
  }

  return result
}
