import { getSettingsPath, readSettings } from "../../core/settings.js";

export async function showCommand(): Promise<void> {
  try {
    console.log("📄 Current Claude Code settings:\n");

    const settings = await readSettings();
    const settingsPath = await getSettingsPath();

    if (!settings) {
      console.log("❌ Settings file not found");
      console.log(`   Expected path: ${settingsPath}`);
      console.log("\n💡 To create settings:");
      console.log("  ccsettings apply --template casual");
      return;
    }

    console.log(`📍 Settings file path: ${settingsPath}\n`);

    // Permissions section
    if (settings.permissions) {
      console.log("🔐 Permission settings:");

      if (settings.permissions.defaultMode) {
        console.log(`   Default mode: ${settings.permissions.defaultMode}`);
      }

      if (settings.permissions.allow && settings.permissions.allow.length > 0) {
        console.log("   Allow rules:");
        settings.permissions.allow.forEach((rule) => {
          console.log(`     ✅ ${rule}`);
        });
      }

      if (settings.permissions.deny && settings.permissions.deny.length > 0) {
        console.log("   Deny rules:");
        settings.permissions.deny.forEach((rule) => {
          console.log(`     ❌ ${rule}`);
        });
      }

      if (
        settings.permissions.additionalDirectories &&
        settings.permissions.additionalDirectories.length > 0
      ) {
        console.log("   Additional directories:");
        settings.permissions.additionalDirectories.forEach((dir) => {
          console.log(`     📁 ${dir}`);
        });
      }

      console.log();
    }

    // Environment variables
    if (settings.env && Object.keys(settings.env).length > 0) {
      console.log("🌍 Environment variables:");
      Object.entries(settings.env).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
      console.log();
    }

    // Other settings
    if (settings.model) {
      console.log(`🤖 Model: ${settings.model}`);
    }

    if (settings.includeCoAuthoredBy !== undefined) {
      console.log(`✍️  Co-authored-by: ${settings.includeCoAuthoredBy ? "enabled" : "disabled"}`);
    }

    if (settings.cleanupPeriodDays !== undefined) {
      console.log(`🧹 Log retention period: ${settings.cleanupPeriodDays} days`);
    }

    if (settings.hooks && Object.keys(settings.hooks).length > 0) {
      console.log("\n🪝 Hook settings:");
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
    console.error("❌ An error occurred:", message);
    process.exit(1);
  }
}
