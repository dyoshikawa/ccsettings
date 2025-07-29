import { getSettingsPath, readSettings } from "../../core/settings.js";

export async function showCommand(): Promise<void> {
  try {
    console.log("📄 現在のClaude Code設定:\n");

    const settings = await readSettings();
    const settingsPath = await getSettingsPath();

    if (!settings) {
      console.log("❌ 設定ファイルが見つかりません");
      console.log(`   予想パス: ${settingsPath}`);
      console.log("\n💡 設定を作成するには:");
      console.log("  ccsettings apply --template casual");
      return;
    }

    console.log(`📍 設定ファイルパス: ${settingsPath}\n`);

    // Permissions section
    if (settings.permissions) {
      console.log("🔐 権限設定:");

      if (settings.permissions.defaultMode) {
        console.log(`   デフォルトモード: ${settings.permissions.defaultMode}`);
      }

      if (settings.permissions.allow && settings.permissions.allow.length > 0) {
        console.log("   許可ルール:");
        settings.permissions.allow.forEach((rule) => {
          console.log(`     ✅ ${rule}`);
        });
      }

      if (settings.permissions.deny && settings.permissions.deny.length > 0) {
        console.log("   拒否ルール:");
        settings.permissions.deny.forEach((rule) => {
          console.log(`     ❌ ${rule}`);
        });
      }

      if (
        settings.permissions.additionalDirectories &&
        settings.permissions.additionalDirectories.length > 0
      ) {
        console.log("   追加ディレクトリ:");
        settings.permissions.additionalDirectories.forEach((dir) => {
          console.log(`     📁 ${dir}`);
        });
      }

      console.log();
    }

    // Environment variables
    if (settings.env && Object.keys(settings.env).length > 0) {
      console.log("🌍 環境変数:");
      Object.entries(settings.env).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
      console.log();
    }

    // Other settings
    if (settings.model) {
      console.log(`🤖 モデル: ${settings.model}`);
    }

    if (settings.includeCoAuthoredBy !== undefined) {
      console.log(`✍️  Co-authored-by: ${settings.includeCoAuthoredBy ? "有効" : "無効"}`);
    }

    if (settings.cleanupPeriodDays !== undefined) {
      console.log(`🧹 ログ保持期間: ${settings.cleanupPeriodDays}日`);
    }

    if (settings.hooks && Object.keys(settings.hooks).length > 0) {
      console.log("\n🪝 フック設定:");
      Object.entries(settings.hooks).forEach(([hookType, hooks]) => {
        console.log(`   ${hookType}:`);
        if (typeof hooks === "object" && hooks !== null) {
          Object.entries(hooks).forEach(([tool, command]) => {
            if (typeof command === "string") {
              console.log(`     ${tool}: ${command}`);
            }
          });
        }
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ エラーが発生しました:", message);
    process.exit(1);
  }
}
