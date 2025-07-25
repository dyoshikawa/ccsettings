import type { z } from "zod/mini";
import { ClaudeSettingsSchema, TemplateSchema } from "../schemas/index.js";

export type ClaudeSettings = z.infer<typeof ClaudeSettingsSchema> & {
  [key: string]: unknown;
};

export type Template = z.infer<typeof TemplateSchema>;

export interface ApplyOptions {
  template?: string | string[];
  file?: string | string[];
  url?: string | string[];
  dryRun?: boolean;
  backup?: boolean;
  force?: boolean;
}

export interface TemplateSource {
  type: "builtin" | "file" | "url";
  value: string;
}
