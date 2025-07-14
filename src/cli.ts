#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { program } from 'commander'
import { applyCommand } from './commands/apply.js'
import { listCommand } from './commands/list.js'
import { showCommand } from './commands/show.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const packageJsonPath = join(__dirname, '../package.json')
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

program
  .name('ccsettings')
  .description(
    'Claude Code設定テンプレートをプロジェクト単位で適用するCLIツール',
  )
  .version(packageJson.version)

// applyコマンド
program
  .command('apply')
  .description('テンプレート設定をプロジェクトに適用')
  .option('-t, --template <name>', 'プリセットテンプレート名', 'default')
  .option('-f, --file <path>', 'ローカルファイルからテンプレートを読み込み')
  .option('-u, --url <url>', 'URLからテンプレートを読み込み')
  .option('--dry-run', '実際の変更を行わずに結果をプレビュー')
  .option('--backup', '変更前の設定をバックアップ')
  .option('--force', '確認なしで上書き')
  .action(applyCommand)

// listコマンド
program
  .command('list')
  .description('利用可能なプリセットテンプレートをリスト表示')
  .action(listCommand)

// showコマンド
program.command('show').description('現在の設定を表示').action(showCommand)

program.parse()
