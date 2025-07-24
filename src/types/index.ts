import type { z } from "zod/mini";
import { ClaudeSettingsSchema, TemplateSchema } from "../schemas/index.js";

export type ClaudeSettings = z.infer<typeof ClaudeSettingsSchema> & {
  [key: string]: unknown;
};

export type Template = z.infer<typeof TemplateSchema>;

export interface ApplyOptions {
  template?: string;
  file?: string;
  url?: string;
  dryRun?: boolean;
  backup?: boolean;
  force?: boolean;
}

export interface TemplateSource {
  type: "builtin" | "file" | "url";
  value: string;
}
