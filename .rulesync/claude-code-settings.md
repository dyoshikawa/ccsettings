---
root: false
targets: ['*']
description: "Claude Code Settings Specifications"
globs: []
---

# Claude Code `settings.json` Specification Summary

## 1. Configuration File Locations and Priority
- User global: `~/.claude/settings.json`
- Project shared: `<project>/.claude/settings.json` (can be committed to VCS)
- Project personal: `<project>/.claude/settings.local.json` (should be in gitignore)
- Enterprise managed policy (highest priority, cannot be overridden by user)
  - macOS: `/Library/Application Support/ClaudeCode/managed-settings.json`
  - Linux/WSL: `/etc/claude-code/managed-settings.json`
  - Windows: `C:\ProgramData\ClaudeCode\managed-settings.json`

**Application order (high→low)**
1. Enterprise policy  
2. Command line arguments  
3. Local settings (`.claude/settings.local.json`)  
4. Shared settings (`.claude/settings.json`)  
5. User settings (`~/.claude/settings.json`)

---

## 2. Main Keys Available at Root Level

| Key | Type | Description | Example |
| ---- | -- | ---- | -- |
| `apiKeyHelper` | `string` | Script executed via `/bin/sh`. Return value used for `X-Api-Key` and `Authorization: Bearer` | `"/bin/generate_temp_api_key.sh"` |
| `cleanupPeriodDays` | `number` | Local chat log retention days (default: 30) | `20` |
| `env` | `object` | Map of environment variables valid for entire session | `{"FOO": "bar"}` |
| `includeCoAuthoredBy` | `boolean` | Whether to add `co-authored-by Claude` to Git commits etc. (default: `true`) | `false` |
| `permissions` | `object` | Permission settings (detailed below) | (see below) |
| `hooks` | `object` | Custom hook settings for before/after tool execution | `{"PreToolUse": {"Bash": "echo 'Running...'"}}` |
| `model` | `string` | Default model name to use | `"claude-3-5-sonnet-20241022"` |
| `forceLoginMethod` | `string` | Force `claudeai` or `console` | `"console"` |
| `enableAllProjectMcpServers` | `boolean` | Auto-approve MCP servers in `.mcp.json` | `true` |
| `enabledMcpjsonServers` | `string[]` | Specify approved MCP server names from `.mcp.json` | `["memory", "github"]` |
| `disabledMcpjsonServers` | `string[]` | Specify rejected MCP server names from `.mcp.json` | `["filesystem"]` |
| `awsAuthRefresh` | `string` | Script to update `.aws` directory | `"aws sso login --profile myprofile"` |
| `awsCredentialExport` | `string` | Script to output AWS credentials as JSON | `"/bin/generate_aws_grant.sh"` |

---

## 3. `permissions` Section Specification

```jsonc
{
  "permissions": {
    "allow": [ /* allow rule array */ ],
    "deny": [  /* deny rule array (takes priority over allow) */ ],
    "additionalDirectories": [ /* additional directories to allow access */ ],
    "defaultMode": "default|acceptEdits|plan|bypassPermissions",
    "disableBypassPermissionsMode": "disable" // optional, disable bypass
  }
}
````

### 3.1 Rule Format

* Basic format: `"Tool"` or `"Tool(condition)"`
* Examples:
  * `Bash(npm run test:*)`：Allow/deny commands starting with `npm run test:`
  * `Read(~/.zshrc)`：Control Read access to specific files
  * `Edit(docs/ **)` ：Control editing within directories (`gitignore` compliant patterns)
  * `WebFetch(domain:example.com)`：Limit to specific domains
  * `mcp__serverName__toolName`：Specify specific MCP tools

### 3.2 `defaultMode` Values

* `default`：Standard mode requesting permission on first tool use
* `acceptEdits`：Auto-approve editing tools
* `plan`：Analysis only. No editing or execution allowed
* `bypassPermissions`：Allow all (recommended only in safe environments)

### 3.3 `additionalDirectories`

* Can permanently add directories other than default working directory
* Also temporarily addable via `--add-dir` / `/add-dir`

> **Note**: Legacy `ignorePatterns` is being deprecated. Use **deny rules** for `Read(...)` or `Edit(...)` as alternatives.

---

## 4. Global Settings (managed via `claude config set -g` etc.)

| Key                      | Description                          | Example                                                                       |
| ----------------------- | --------------------------- | ----------------------------------------------------------------------- |
| `autoUpdates`           | Enable automatic updates (default: `true`) | `false`                                                                 |
| `preferredNotifChannel` | Notification method                        | `iterm2`, `iterm2_with_bell`, `terminal_bell`, `notifications_disabled` |
| `theme`                 | Theme                         | `dark`, `light`, `light-daltonized`, `dark-daltonized`                  |
| `verbose`               | Whether to show full Bash and command output        | `true`                                                                  |

---

## 5. Environment Variables (can also be set via `env`)

Representative examples (excerpt):

* Authentication related

  * `ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_CUSTOM_HEADERS`
* Model specification

  * `ANTHROPIC_MODEL`, `ANTHROPIC_SMALL_FAST_MODEL`
* Bash execution limits

  * `BASH_DEFAULT_TIMEOUT_MS`, `BASH_MAX_TIMEOUT_MS`, `BASH_MAX_OUTPUT_LENGTH`
* Claude Code behavior control

  * `CLAUDE_CODE_MAX_OUTPUT_TOKENS`, `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`, `CLAUDE_CODE_DISABLE_TERMINAL_TITLE`
  * `DISABLE_AUTOUPDATER`, `DISABLE_BUG_COMMAND`, `DISABLE_ERROR_REPORTING`, `DISABLE_TELEMETRY`, `DISABLE_COST_WARNINGS`
* MCP related

  * `MCP_TIMEOUT`, `MCP_TOOL_TIMEOUT`, `MAX_MCP_OUTPUT_TOKENS`
* Proxy

  * `HTTP_PROXY`, `HTTPS_PROXY`
* Vertex / Bedrock region variables

  * `VERTEX_REGION_CLAUDE_3_5_SONNET` etc.
  * `AWS_BEARER_TOKEN_BEDROCK` etc.

---

## 6. Common CLI Operations

* List settings: `claude config list`
* Get individual: `claude config get <key>`
* Change setting: `claude config set <key> <value>`
* Add to list: `claude config add <key> <value>`
* Remove from list: `claude config remove <key> <value>`
* Target global settings: `--global` / `-g`

---

## 7. Tool List (Permission Control Targets)

* Standard tool examples: Bash / Edit / MultiEdit / NotebookEdit / Read / Write / WebFetch / WebSearch / Grep / Glob / LS / Task / TodoWrite etc.
  ※ Mix of tools that require permissions and those that don't

---

## 8. Sample `settings.json`

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

## 9. Notes

* `ignorePatterns` is deprecated in current specification. Replace with `Read(...)` / `Edit(...)` in `permissions.deny`.
* When using `apiKeyHelper`, refresh interval can be changed with `CLAUDE_CODE_API_KEY_HELPER_TTL_MS`.
* Session permissions can be edited GUI-style from `/permissions` command.
