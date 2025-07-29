import { createInterface } from "node:readline/promises";
import { loadTemplates } from "../../core/loader.js";
import { createMultipleMergePreview } from "../../core/merger.js";
import { createBackup, readSettings, writeSettings } from "../../core/settings.js";
import type { ApplyOptions } from "../../types/index.js";

export async function applyCommand(options: ApplyOptions): Promise<void> {
  try {
    // Load templates
    console.log("📥 Loading templates...");
    const templates = await loadTemplates(options.template, options.file, options.url);

    if (templates.length === 1) {
      console.log(`✅ Loaded template "${templates[0]!.name}": ${templates[0]!.description}`);
    } else {
      console.log(`✅ Loaded ${templates.length} templates:`);
      templates.forEach((template, index) => {
        console.log(`  ${index + 1}. "${template.name}": ${template.description}`);
      });
    }

    // Read existing settings
    const existing = await readSettings(options.local);

    // Create merge preview
    const { merged, changes } = createMultipleMergePreview(
      existing,
      templates.map((t) => t.settings),
      templates.map((t) => t.name),
    );

    // Display preview
    const settingsType = options.local ? "local settings" : "shared settings";
    console.log(`\n📋 Planned changes (${settingsType}):`);
    if (changes.added.length > 0) {
      console.log("\n🆕 Settings to be added:");
      changes.added.forEach((change) => {
        const source = changes.templateSources?.get(change);
        const sourceText = source ? ` [from: ${source}]` : "";
        console.log(`  + ${change}${sourceText}`);
      });
    }

    if (changes.modified.length > 0) {
      console.log("\n✏️  Settings to be modified:");
      changes.modified.forEach((change) => {
        const source = changes.templateSources?.get(change);
        const sourceText = source ? ` [from: ${source}]` : "";
        console.log(`  ~ ${change}${sourceText}`);
      });
    }

    if (changes.unchanged.length > 0) {
      console.log("\n⏸️  Existing settings to be preserved:");
      changes.unchanged.forEach((change) => console.log(`  = ${change}`));
    }

    if (options.dryRun) {
      console.log("\n🔍 Dry-run mode: No actual changes were made");
      return;
    }

    // Confirmation
    if (!options.force) {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await rl.question("\n❓ Apply settings? (y/N): ");
      rl.close();

      if (answer.toLowerCase() !== "y" && answer.toLowerCase() !== "yes") {
        console.log("⏹️  Application cancelled");
        return;
      }
    }

    // Create backup if requested
    if (options.backup && existing) {
      try {
        const backupPath = await createBackup(options.local);
        console.log(`💾 Backup created: ${backupPath}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`⚠️  Failed to create backup: ${message}`);
      }
    }

    // Apply settings
    await writeSettings(merged, options.local);
    const successMessage = options.local
      ? "✅ Local settings applied successfully!"
      : "✅ Settings applied successfully!";
    console.log(successMessage);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ An error occurred:", message);
    process.exit(1);
  }
}
