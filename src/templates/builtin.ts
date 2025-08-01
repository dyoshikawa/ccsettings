import { z } from "zod/mini";
import { TemplateSchema } from "../schemas/index.js";
import type { Template } from "../types/index.js";

const BuiltinTemplatesSchema = z.record(z.string(), TemplateSchema);

const rawBuiltinTemplates = {
  casual: {
    name: "casual",
    description: "Casual settings.",
    settings: {
      permissions: {
        allow: [
          "Bash(git:*)",
          "Bash(gh:*)",
          "Bash(touch:*)",
          "Bash(ls:*)",
          "Bash(mkdir:*)",
          "Bash(rg:*)",
          "Bash(grep:*)",
          "Bash(cp:*)",
          "Bash(mv:*)",
          "Bash(rm:*)",
          "Read(**)",
          "Edit(**)",
          "MultiEdit(**)",
          "WebFetch(domain:*)",
          "WebSearch(domain:*)",
          "Write(**)",
        ],
        deny: [
          "Bash(rm -rf ~/)",
          "Bash(rm -rf //)",
          "Bash(git remote add:*)",
          "Bash(git remote set-url:*)",
        ],
        defaultMode: "acceptEdits",
      },
      env: {
        BASH_DEFAULT_TIMEOUT_MS: "300000",
        BASH_MAX_TIMEOUT_MS: "1200000",
      },
    },
  },

  strict: {
    name: "strict",
    description: "Strict settings.",
    settings: {
      permissions: {
        allow: ["Bash(git:*)", "Bash(gh:*)", "Read(**)", "Edit(**)", "MultiEdit(**)", "Write(**)"],
        deny: [
          "Bash(rm -rf ~/)",
          "Bash(rm -rf //**)",
          "Bash(git remote add:*)",
          "Bash(git remote set-url:*)",
        ],
        defaultMode: "acceptEdits",
      },
      env: {
        BASH_DEFAULT_TIMEOUT_MS: "300000",
        BASH_MAX_TIMEOUT_MS: "1200000",
      },
    },
  },

  node: {
    name: "node",
    description: "Node.js development settings.",
    settings: {
      permissions: {
        allow: ["Bash(npm:*)", "Bash(yarn:*)", "Bash(pnpm:*)"],
        deny: ["Bash(npm publish:*)", "Bash(pnpm publish:*)", "Bash(yarn publish:*)"],
        defaultMode: "acceptEdits",
      },
      env: {
        BASH_DEFAULT_TIMEOUT_MS: "300000",
        BASH_MAX_TIMEOUT_MS: "1200000",
      },
    },
  },
} as const;

export const builtinTemplates: Record<string, Template> =
  BuiltinTemplatesSchema.parse(rawBuiltinTemplates);

export function getBuiltinTemplate(name: string): Template | undefined {
  return builtinTemplates[name];
}

export function listBuiltinTemplates(): Template[] {
  return Object.values(builtinTemplates);
}
