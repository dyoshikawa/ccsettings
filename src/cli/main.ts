import { program } from "commander";
import { applyCommand } from "./commands/apply.js";
import { listCommand } from "./commands/list.js";
import { showCommand } from "./commands/show.js";

export async function main(): Promise<void> {
  program
    .name("ccsettings")
    .description("Claude Code Settings Manager - Apply settings templates to projects")
    .version("1.0.0");

  program
    .command("apply")
    .description("Apply a settings template to the current project")
    .option(
      "-t, --template <name>",
      "Apply a built-in template (default, strict, development, testing)",
    )
    .option("-f, --file <path>", "Apply settings from a local file")
    .option("-u, --url <url>", "Apply settings from a URL")
    .option("--dry-run", "Preview changes without applying them")
    .option("--backup", "Create a backup before applying changes")
    .option("--force", "Apply changes without confirmation")
    .action(applyCommand);

  program.command("list").description("List available built-in templates").action(listCommand);

  program.command("show").description("Show current settings").action(showCommand);

  await program.parseAsync(process.argv);
}
