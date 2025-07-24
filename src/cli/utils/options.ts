import { execSync } from "node:child_process";
import type { CliOptions, ParsedCliOptions } from "../../types/index.js";

export async function parseCliOptions(options: CliOptions): Promise<ParsedCliOptions> {
  const now = new Date();
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  return {
    githubToken: getGitHubToken(options.githubToken),
    output: options.output ?? "./ghevents.xml",
    since: options.since ? new Date(options.since) : twoWeeksAgo,
    until: options.until ? new Date(options.until) : now,
    visibility: options.visibility ?? "public",
    maxLength: options.maxLength ? parseInt(options.maxLength.toString(), 10) : 500000,
    order: options.order ?? "asc",
  };
}

function getGitHubToken(providedToken?: string): string {
  if (providedToken) {
    return providedToken;
  }

  const envToken = process.env.GITHUB_TOKEN;
  if (envToken) {
    return envToken;
  }

  try {
    const ghToken = execSync("gh auth token", { encoding: "utf8" }).trim();
    return ghToken;
  } catch {
    throw new Error(
      "No GitHub token found. Please provide --github-token, set GITHUB_TOKEN environment variable, or authenticate with gh CLI",
    );
  }
}
