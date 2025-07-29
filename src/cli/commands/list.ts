import { listBuiltinTemplates } from "../../templates/builtin.js";

export async function listCommand(): Promise<void> {
  console.log("📋 Available builtin templates:\n");

  const templates = listBuiltinTemplates();

  templates.forEach((template) => {
    console.log(`🔹 ${template.name}`);
    console.log(`   ${template.description}`);

    if (template.settings.permissions) {
      const { permissions } = template.settings;

      if (permissions.defaultMode) {
        console.log(`   Default mode: ${permissions.defaultMode}`);
      }

      if (permissions.allow && permissions.allow.length > 0) {
        console.log(`   Allow rules: ${permissions.allow.length}`);
      }

      if (permissions.deny && permissions.deny.length > 0) {
        console.log(`   Deny rules: ${permissions.deny.length}`);
      }
    }

    console.log();
  });

  console.log("💡 Usage examples:");
  console.log("  ccsettings apply --template default");
  console.log("  ccsettings apply --template strict");
  console.log("  ccsettings apply --template node");
}
