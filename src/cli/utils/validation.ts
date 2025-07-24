import type { ParsedCliOptions } from "../../types/index.js";

export function validateOptions(options: ParsedCliOptions): void {
  if (!options.githubToken) {
    throw new Error("GitHub token is required");
  }

  if (isNaN(options.since.getTime())) {
    throw new Error("Invalid --since date format. Use ISO8601 format (e.g., 2023-01-01T00:00:00Z)");
  }

  if (isNaN(options.until.getTime())) {
    throw new Error("Invalid --until date format. Use ISO8601 format (e.g., 2023-01-01T00:00:00Z)");
  }

  if (options.since >= options.until) {
    throw new Error("--since date must be before --until date");
  }

  if (!["public", "private", "all"].includes(options.visibility)) {
    throw new Error("--visibility must be one of: public, private, all");
  }

  if (options.maxLength <= 0) {
    throw new Error("--max-length must be a positive number");
  }

  if (!["asc", "desc"].includes(options.order)) {
    throw new Error("--order must be one of: asc, desc");
  }
}
