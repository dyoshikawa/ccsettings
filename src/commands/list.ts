import { listBuiltinTemplates } from '../templates/index.js'

export async function listCommand(): Promise<void> {
  console.log('📋 利用可能なプリセットテンプレート:\n')

  const templates = listBuiltinTemplates()

  for (const template of templates) {
    console.log(`  ${template.name.padEnd(15)} - ${template.description}`)
  }

  console.log('\n使用方法:')
  console.log('  ccsettings apply --template <template-name>')
  console.log('\n例:')
  console.log('  ccsettings apply --template strict')
}
