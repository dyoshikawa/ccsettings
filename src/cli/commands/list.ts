import { listBuiltinTemplates } from "../../templates/builtin.js";

export async function listCommand(): Promise<void> {
  console.log("📋 利用可能なビルトインテンプレート:\n");

  const templates = listBuiltinTemplates();

  templates.forEach((template) => {
    console.log(`🔹 ${template.name}`);
    console.log(`   ${template.description}`);

    if (template.settings.permissions) {
      const { permissions } = template.settings;

      if (permissions.defaultMode) {
        console.log(`   デフォルトモード: ${permissions.defaultMode}`);
      }

      if (permissions.allow && permissions.allow.length > 0) {
        console.log(`   許可ルール数: ${permissions.allow.length}`);
      }

      if (permissions.deny && permissions.deny.length > 0) {
        console.log(`   拒否ルール数: ${permissions.deny.length}`);
      }
    }

    console.log();
  });

  console.log("💡 使用例:");
  console.log("  ccsettings apply --template default");
  console.log("  ccsettings apply --template strict");
  console.log("  ccsettings apply --template development");
  console.log("  ccsettings apply --template testing");
}
