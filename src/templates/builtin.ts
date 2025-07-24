import type { Template } from "../types/index.js";

export const builtinTemplates: Record<string, Template> = {
  default: {
    name: "default",
    description: "基本的な権限設定",
    settings: {
      permissions: {
        allow: [
          "Read(src/**)",
          "Read(*.{js,ts,json,md})",
          "Edit(src/**)",
          "Bash(npm run lint)",
          "Bash(npm run test)",
        ],
        deny: ["Bash(rm -rf *)", "Bash(sudo *)", "Write(/etc/**)"],
        defaultMode: "default",
      },
    },
  },

  strict: {
    name: "strict",
    description: "厳格なセキュリティ設定",
    settings: {
      permissions: {
        allow: ["Read(src/**)", "Read(*.md)"],
        deny: ["Bash(*)", "WebFetch(*)", "Write(*)", "Edit(*)"],
        defaultMode: "plan",
      },
    },
  },

  development: {
    name: "development",
    description: "開発環境向けの緩い設定",
    settings: {
      permissions: {
        allow: [
          "Read(**)",
          "Edit(src/**)",
          "Edit(*.{js,ts,json,md})",
          "Bash(npm run *)",
          "Bash(yarn *)",
          "Bash(git *)",
          "WebFetch(domain:github.com)",
          "WebFetch(domain:npmjs.com)",
        ],
        deny: ["Bash(rm -rf *)", "Bash(sudo *)", "Edit(/etc/**)"],
        defaultMode: "acceptEdits",
      },
      env: {
        NODE_ENV: "development",
      },
    },
  },

  testing: {
    name: "testing",
    description: "テスト実行に特化した設定",
    settings: {
      permissions: {
        allow: [
          "Read(**)",
          "Edit(test/**)",
          "Edit(spec/**)",
          "Edit(*.test.*)",
          "Edit(*.spec.*)",
          "Bash(npm run test*)",
          "Bash(npm run lint)",
          "Bash(yarn test*)",
          "Bash(vitest *)",
          "Bash(jest *)",
        ],
        deny: ["Edit(src/**)", "Bash(rm -rf *)", "Bash(sudo *)"],
        defaultMode: "acceptEdits",
      },
      env: {
        NODE_ENV: "test",
      },
    },
  },
};

export function getBuiltinTemplate(name: string): Template | undefined {
  return builtinTemplates[name];
}

export function listBuiltinTemplates(): Template[] {
  return Object.values(builtinTemplates);
}
