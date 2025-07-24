---
root: false
targets: ['*']
description: "Claude Code Settings Specifications"
globs: []
---

# Claude Code `settings.json` 仕様まとめ

## 1. 設定ファイルの場所と優先順位
- ユーザー共通: `~/.claude/settings.json`
- プロジェクト共有: `<project>/.claude/settings.json`（VCSにコミット可）
- プロジェクト個人用: `<project>/.claude/settings.local.json`（gitignore対象）
- エンタープライズ管理ポリシー（最優先・ユーザー側で上書き不可）
  - macOS: `/Library/Application Support/ClaudeCode/managed-settings.json`
  - Linux/WSL: `/etc/claude-code/managed-settings.json`
  - Windows: `C:\ProgramData\ClaudeCode\managed-settings.json`

**適用順序（高→低）**
1. エンタープライズポリシー  
2. コマンドライン引数  
3. ローカル設定（`.claude/settings.local.json`）  
4. 共有設定（`.claude/settings.json`）  
5. ユーザー設定（`~/.claude/settings.json`）

---

## 2. ルート直下で利用できる主要キー一覧

| キー | 型 | 説明 | 例 |
| ---- | -- | ---- | -- |
| `apiKeyHelper` | `string` | `/bin/sh`で実行されるスクリプト。返り値を `X-Api-Key` と `Authorization: Bearer` に利用 | `"/bin/generate_temp_api_key.sh"` |
| `cleanupPeriodDays` | `number` | ローカルのチャットログ保持日数（デフォルト: 30） | `20` |
| `env` | `object` | セッション全体で有効な環境変数のマップ | `{"FOO": "bar"}` |
| `includeCoAuthoredBy` | `boolean` | `co-authored-by Claude` を Git コミット等に付与するか（デフォルト: `true`） | `false` |
| `permissions` | `object` | 権限設定（下記詳細） | （後述） |
| `hooks` | `object` | ツール実行前後のカスタムフック設定 | `{"PreToolUse": {"Bash": "echo 'Running...'"}}` |
| `model` | `string` | 既定で使用するモデル名 | `"claude-3-5-sonnet-20241022"` |
| `forceLoginMethod` | `string` | `claudeai` または `console` を強制 | `"console"` |
| `enableAllProjectMcpServers` | `boolean` | `.mcp.json` 内の MCP サーバーを自動承認 | `true` |
| `enabledMcpjsonServers` | `string[]` | `.mcp.json` 内から承認する MCP サーバー名指定 | `["memory", "github"]` |
| `disabledMcpjsonServers` | `string[]` | `.mcp.json` 内から拒否する MCP サーバー名指定 | `["filesystem"]` |
| `awsAuthRefresh` | `string` | `.aws` ディレクトリを更新するスクリプト | `"aws sso login --profile myprofile"` |
| `awsCredentialExport` | `string` | AWS資格情報を JSON で出力するスクリプト | `"/bin/generate_aws_grant.sh"` |

---

## 3. `permissions` セクション仕様

```jsonc
{
  "permissions": {
    "allow": [ /* 許可ルール配列 */ ],
    "deny": [  /* 拒否ルール配列（allow より優先） */ ],
    "additionalDirectories": [ /* 追加でアクセスを許可するディレクトリ */ ],
    "defaultMode": "default|acceptEdits|plan|bypassPermissions",
    "disableBypassPermissionsMode": "disable" // 任意、bypass禁止
  }
}
````

### 3.1 ルール書式

* 基本形: `"Tool"` または `"Tool(条件)"`
* 例:
  * `Bash(npm run test:*)`：`npm run test:`で始まるコマンドを許可/拒否
  * `Read(~/.zshrc)`：特定ファイルの Read を制御
  * `Edit(docs/ **)` ：ディレクトリ以下の編集を制御（`gitignore` 準拠パターン）
  * `WebFetch(domain:example.com)`：対象ドメインを限定
  * `mcp__serverName__toolName`：特定 MCP ツールを指定

### 3.2 `defaultMode` 値

* `default`：初回ツール使用時に許可を求める標準モード
* `acceptEdits`：編集系ツールを自動許可
* `plan`：解析のみ。編集や実行不可
* `bypassPermissions`：全許可（安全環境でのみ推奨）

### 3.3 `additionalDirectories`

* 既定の作業ディレクトリ以外を永続的に追加可
* `--add-dir` / `/add-dir` でも一時追加可能

> **補足**: 旧 `ignorePatterns` は廃止方向。代替として `Read(...)` や `Edit(...)` の **deny ルール** を用いる。

---

## 4. グローバル設定（`claude config set -g` などで管理）

| キー                      | 説明                          | 例                                                                       |
| ----------------------- | --------------------------- | ----------------------------------------------------------------------- |
| `autoUpdates`           | 自動アップデートを有効化（デフォルト: `true`） | `false`                                                                 |
| `preferredNotifChannel` | 通知方法                        | `iterm2`, `iterm2_with_bell`, `terminal_bell`, `notifications_disabled` |
| `theme`                 | テーマ                         | `dark`, `light`, `light-daltonized`, `dark-daltonized`                  |
| `verbose`               | Bash やコマンド出力をフル表示するか        | `true`                                                                  |

---

## 5. 環境変数（`env` でも設定可）

代表例（抜粋）:

* 認証関連

  * `ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_CUSTOM_HEADERS`
* モデル指定

  * `ANTHROPIC_MODEL`, `ANTHROPIC_SMALL_FAST_MODEL`
* Bash 実行制限

  * `BASH_DEFAULT_TIMEOUT_MS`, `BASH_MAX_TIMEOUT_MS`, `BASH_MAX_OUTPUT_LENGTH`
* Claude Code 動作制御

  * `CLAUDE_CODE_MAX_OUTPUT_TOKENS`, `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`, `CLAUDE_CODE_DISABLE_TERMINAL_TITLE`
  * `DISABLE_AUTOUPDATER`, `DISABLE_BUG_COMMAND`, `DISABLE_ERROR_REPORTING`, `DISABLE_TELEMETRY`, `DISABLE_COST_WARNINGS`
* MCP 関連

  * `MCP_TIMEOUT`, `MCP_TOOL_TIMEOUT`, `MAX_MCP_OUTPUT_TOKENS`
* プロキシ

  * `HTTP_PROXY`, `HTTPS_PROXY`
* Vertex / Bedrock 用リージョン変数

  * `VERTEX_REGION_CLAUDE_3_5_SONNET` など
  * `AWS_BEARER_TOKEN_BEDROCK` など

---

## 6. 代表的な CLI 操作

* 設定一覧: `claude config list`
* 個別取得: `claude config get <key>`
* 設定変更: `claude config set <key> <value>`
* リストに追加: `claude config add <key> <value>`
* リストから削除: `claude config remove <key> <value>`
* グローバル設定対象: `--global` / `-g`

---

## 7. ツール一覧（許可制御対象）

* 標準ツール例: Bash / Edit / MultiEdit / NotebookEdit / Read / Write / WebFetch / WebSearch / Grep / Glob / LS / Task / TodoWrite など
  ※ Permission が必要なツールと不要なツールが混在

---

## 8. サンプル `settings.json`

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run test:*)",
      "Read(~/.zshrc)"
    ],
    "deny": [
      "Bash(curl:*)"
    ],
    "additionalDirectories": [
      "../docs/"
    ],
    "defaultMode": "acceptEdits"
  },
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "OTEL_METRICS_EXPORTER": "otlp"
  },
  "model": "claude-3-5-sonnet-20241022",
  "includeCoAuthoredBy": true,
  "cleanupPeriodDays": 20,
  "hooks": {
    "PreToolUse": {
      "Bash": "echo 'Running command...'"
    }
  }
}
```

---

## 9. 補足

* `ignorePatterns` は現行仕様では非推奨。`permissions.deny` の `Read(...)` / `Edit(...)` で置き換え。
* `apiKeyHelper` 利用時、`CLAUDE_CODE_API_KEY_HELPER_TTL_MS` でリフレッシュ間隔変更可。
* セッション中の許可は `/permissions` コマンドから GUI 的に編集可。
