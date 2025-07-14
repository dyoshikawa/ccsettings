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
    'CLI tool to apply Claude Code setting templates on a per-project basis',
  )
  .version(packageJson.version)

// apply command
program
  .command('apply')
  .description('Apply template settings to the project')
  .option('-t, --template <name>', 'Preset template name', 'default')
  .option('-f, --file <path>', 'Load template from local file')
  .option('-u, --url <url>', 'Load template from URL')
  .option('--dry-run', 'Preview the result without making actual changes')
  .option('--backup', 'Backup settings before making changes')
  .option('--force', 'Overwrite without confirmation')
  .action(applyCommand)

// list command
program
  .command('list')
  .description('List available preset templates')
  .action(listCommand)

// show command
program.command('show').description('Show current settings').action(showCommand)

program.parse()
