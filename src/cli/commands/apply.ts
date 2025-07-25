import { createInterface } from "node:readline/promises";
import { loadTemplates } from "../../core/loader.js";
import { createMultipleMergePreview } from "../../core/merger.js";
import { createBackup, readSettings, writeSettings } from "../../core/settings.js";
import type { ApplyOptions } from "../../types/index.js";

export async function applyCommand(options: ApplyOptions): Promise<void> {
  try {
    // Load templates
    console.log("📥 テンプレートを読み込んでいます...");
    const templates = await loadTemplates(options.template, options.file, options.url);

    if (templates.length === 1) {
      console.log(
        `✅ テンプレート "${templates[0]!.name}" を読み込みました: ${templates[0]!.description}`,
      );
    } else {
      console.log(`✅ ${templates.length}個のテンプレートを読み込みました:`);
      templates.forEach((template, index) => {
        console.log(`  ${index + 1}. "${template.name}": ${template.description}`);
      });
    }

    // Read existing settings
    const existing = await readSettings();

    // Create merge preview
    const { merged, changes } = createMultipleMergePreview(
      existing,
      templates.map((t) => t.settings),
      templates.map((t) => t.name),
    );

    // Display preview
    console.log("\n📋 適用予定の変更:");
    if (changes.added.length > 0) {
      console.log("\n🆕 追加される設定:");
      changes.added.forEach((change) => {
        const source = changes.templateSources?.get(change);
        const sourceText = source ? ` [from: ${source}]` : "";
        console.log(`  + ${change}${sourceText}`);
      });
    }

    if (changes.modified.length > 0) {
      console.log("\n✏️  変更される設定:");
      changes.modified.forEach((change) => {
        const source = changes.templateSources?.get(change);
        const sourceText = source ? ` [from: ${source}]` : "";
        console.log(`  ~ ${change}${sourceText}`);
      });
    }

    if (changes.unchanged.length > 0) {
      console.log("\n⏸️  保持される既存設定:");
      changes.unchanged.forEach((change) => console.log(`  = ${change}`));
    }

    if (options.dryRun) {
      console.log("\n🔍 ドライランモード: 実際の変更は行われませんでした");
      return;
    }

    // Confirmation
    if (!options.force) {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await rl.question("\n❓ 設定を適用しますか? (y/N): ");
      rl.close();

      if (answer.toLowerCase() !== "y" && answer.toLowerCase() !== "yes") {
        console.log("⏹️  適用がキャンセルされました");
        return;
      }
    }

    // Create backup if requested
    if (options.backup && existing) {
      try {
        const backupPath = await createBackup();
        console.log(`💾 バックアップを作成しました: ${backupPath}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`⚠️  バックアップの作成に失敗しました: ${message}`);
      }
    }

    // Apply settings
    await writeSettings(merged);
    console.log("✅ 設定が正常に適用されました!");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ エラーが発生しました:", message);
    process.exit(1);
  }
}
