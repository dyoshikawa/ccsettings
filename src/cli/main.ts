import { program } from "commander";
import { applyCommand } from "./commands/apply.js";
import { listCommand } from "./commands/list.js";
import { showCommand } from "./commands/show.js";

export async function main(): Promise<void> {
  program
    .name("ccsettings")
    .description("Claude Code Settings Manager - Apply settings templates to projects")
    .version("0.9.0");

  const applyCmd = program
    .command("apply")
    .description("Apply settings templates to the current project")
    .option("-t, --template <name>", "Apply built-in templates (can be specified multiple times)")
    .option(
      "-f, --file <path>",
      "Apply settings from local files (can be specified multiple times)",
    )
    .option("-u, --url <url>", "Apply settings from URLs (can be specified multiple times)")
    .option("--dry-run", "Preview changes without applying them")
    .option("--backup", "Create a backup before applying changes")
    .option("--force", "Apply changes without confirmation")
    .option("--local", "Apply settings to .claude/settings.local.json instead of settings.json");

  // Custom parsing for multiple templates
  let multipleTemplates: string[] | undefined;
  let multipleFiles: string[] | undefined;
  let multipleUrls: string[] | undefined;

  applyCmd.hook("preAction", () => {
    const args = process.argv;
    const templates: string[] = [];
    const files: string[] = [];
    const urls: string[] = [];

    for (let i = 0; i < args.length; i++) {
      if (args[i] === "-t" || args[i] === "--template") {
        if (i + 1 < args.length && args[i + 1] && !args[i + 1]!.startsWith("-")) {
          templates.push(args[i + 1]!);
          i++; // Skip the value
        }
      } else if (args[i] === "-f" || args[i] === "--file") {
        if (i + 1 < args.length && args[i + 1] && !args[i + 1]!.startsWith("-")) {
          files.push(args[i + 1]!);
          i++; // Skip the value
        }
      } else if (args[i] === "-u" || args[i] === "--url") {
        if (i + 1 < args.length && args[i + 1] && !args[i + 1]!.startsWith("-")) {
          urls.push(args[i + 1]!);
          i++; // Skip the value
        }
      }
    }

    // Store the parsed values
    multipleTemplates = templates.length > 0 ? templates : undefined;
    multipleFiles = files.length > 0 ? files : undefined;
    multipleUrls = urls.length > 0 ? urls : undefined;
  });

  applyCmd.action((options) => {
    const processedOptions = {
      ...options,
      template: multipleTemplates,
      file: multipleFiles,
      url: multipleUrls,
    };
    return applyCommand(processedOptions);
  });

  program.command("list").description("List available built-in templates").action(listCommand);

  program.command("show").description("Show current settings").action(showCommand);

  await program.parseAsync(process.argv);
}
