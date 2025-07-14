import { getBuiltinTemplate } from '../templates/index.js'
import type { Template } from '../types/index.js'
import {
  backupSettings,
  readProjectSettings,
  readTemplateFromFile,
  readTemplateFromUrl,
  writeProjectSettings,
} from '../utils/file.js'
import { mergeSettings } from '../utils/merge.js'

interface ApplyOptions {
  template: string
  file?: string
  url?: string
  dryRun?: boolean
  backup?: boolean
  force?: boolean
}

export async function applyCommand(options: ApplyOptions): Promise<void> {
  try {
    // テンプレートの取得
    let template: Template | undefined

    if (options.file) {
      console.log(`📁 ファイルからテンプレートを読み込み中: ${options.file}`)
      template = await readTemplateFromFile(options.file)
    } else if (options.url) {
      console.log(`🌐 URLからテンプレートを読み込み中: ${options.url}`)
      template = await readTemplateFromUrl(options.url)
    } else {
      console.log(`📋 プリセットテンプレートを使用: ${options.template}`)
      template = getBuiltinTemplate(options.template)
      if (!template) {
        console.error(`❌ テンプレート '${options.template}' が見つかりません`)
        console.log(
          '💡 利用可能なテンプレートを確認するには `ccsettings list` を実行してください',
        )
        process.exit(1)
      }
    }

    // 既存設定の読み込み
    const existingSettings = await readProjectSettings()

    // マージ処理
    const mergedSettings = existingSettings
      ? mergeSettings(existingSettings, template.settings)
      : template.settings

    // dry-runモード
    if (options.dryRun) {
      console.log('\n🔍 プレビューモード (実際の変更は行われません)\n')
      console.log('適用される設定:')
      console.log(JSON.stringify(mergedSettings, null, 2))
      return
    }

    // 確認プロンプト（forceフラグがない場合）
    if (!options.force && existingSettings) {
      console.log('\n⚠️  既存の設定ファイルが見つかりました')
      console.log('上書きしてもよろしいですか？ (yes/no)')

      const readline = await import('node:readline/promises')
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })

      const answer = await rl.question('> ')
      rl.close()

      if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
        console.log('❌ 操作をキャンセルしました')
        process.exit(0)
      }
    }

    // バックアップの作成
    if (options.backup && existingSettings) {
      const backupPath = await backupSettings()
      if (backupPath) {
        console.log(`💾 バックアップを作成しました: ${backupPath}`)
      }
    }

    // 設定の書き込み
    await writeProjectSettings(mergedSettings)
    console.log('✅ 設定を正常に適用しました')

    if (existingSettings) {
      console.log('📝 既存の設定とマージされました')
    } else {
      console.log('📝 新しい設定ファイルを作成しました')
    }
  } catch (error) {
    console.error(
      '❌ エラーが発生しました:',
      error instanceof Error ? error.message : String(error),
    )
    process.exit(1)
  }
}
