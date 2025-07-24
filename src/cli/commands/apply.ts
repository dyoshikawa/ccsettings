import { createInterface } from 'node:readline/promises';
import type { ApplyOptions } from '../../types/index.js';
import { loadTemplate } from '../../core/loader.js';
import { readSettings, writeSettings, createBackup } from '../../core/settings.js';
import { createMergePreview } from '../../core/merger.js';

export async function applyCommand(options: ApplyOptions): Promise<void> {
  try {
    // Load template
    console.log('📥 テンプレートを読み込んでいます...');
    const template = await loadTemplate(options.template, options.file, options.url);
    console.log(`✅ テンプレート "${template.name}" を読み込みました: ${template.description}`);
    
    // Read existing settings
    const existing = await readSettings();
    
    // Create merge preview
    const { merged, changes } = createMergePreview(existing, template.settings);
    
    // Display preview
    console.log('\n📋 適用予定の変更:');
    if (changes.added.length > 0) {
      console.log('\n🆕 追加される設定:');
      changes.added.forEach(change => console.log(`  + ${change}`));
    }
    
    if (changes.modified.length > 0) {
      console.log('\n✏️  変更される設定:');
      changes.modified.forEach(change => console.log(`  ~ ${change}`));
    }
    
    if (changes.unchanged.length > 0) {
      console.log('\n⏸️  保持される既存設定:');
      changes.unchanged.forEach(change => console.log(`  = ${change}`));
    }
    
    if (options.dryRun) {
      console.log('\n🔍 ドライランモード: 実際の変更は行われませんでした');
      return;
    }
    
    // Confirmation
    if (!options.force) {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      
      const answer = await rl.question('\n❓ 設定を適用しますか? (y/N): ');
      rl.close();
      
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('⏹️  適用がキャンセルされました');
        return;
      }
    }
    
    // Create backup if requested
    if (options.backup && existing) {
      try {
        const backupPath = await createBackup();
        console.log(`💾 バックアップを作成しました: ${backupPath}`);
      } catch (error) {
        console.warn(`⚠️  バックアップの作成に失敗しました: ${(error as Error).message}`);
      }
    }
    
    // Apply settings
    await writeSettings(merged);
    console.log('✅ 設定が正常に適用されました!');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', (error as Error).message);
    process.exit(1);
  }
}