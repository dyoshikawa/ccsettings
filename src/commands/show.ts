import { join } from 'node:path'
import { readProjectSettings } from '../utils/file.js'

export async function showCommand(): Promise<void> {
  const settings = await readProjectSettings()

  if (!settings) {
    console.log('❌ 設定ファイルが見つかりません')
    console.log(`📍 検索場所: ${join(process.cwd(), '.claude/settings.json')}`)
    console.log('\n💡 設定を作成するには以下のコマンドを実行してください:')
    console.log('  ccsettings apply')
    return
  }

  console.log('📋 現在のClaude Code設定:\n')
  console.log(JSON.stringify(settings, null, 2))
}
