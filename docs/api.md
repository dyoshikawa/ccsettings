# API リファレンス

## コマンドライン API

### ccsettings apply

テンプレートを現在のプロジェクトに適用します。

```bash
ccsettings apply [options]
```

#### オプション

| オプション | 短縮形 | 説明 | デフォルト |
|-----------|--------|------|-----------|
| `--template <name>` | `-t` | ビルトインテンプレート名を指定 | `default` |
| `--file <path>` | `-f` | ローカルファイルパスを指定 | - |
| `--url <url>` | `-u` | テンプレートURLを指定 | - |
| `--dry-run` | - | プレビューのみ表示 | `false` |
| `--backup` | - | 変更前にバックアップを作成 | `false` |
| `--force` | - | 確認なしで適用 | `false` |

#### 優先順位
1. `--url` > `--file` > `--template` > デフォルト（`default`）

#### 戻り値
- **成功**: 終了コード 0
- **エラー**: 終了コード 1

#### 使用例

```bash
# 基本的な適用
ccsettings apply

# テンプレート指定
ccsettings apply --template development

# ドライラン
ccsettings apply --template strict --dry-run

# バックアップ付きで強制適用
ccsettings apply --file ./custom.json --backup --force
```

### ccsettings list

利用可能なビルトインテンプレートを一覧表示します。

```bash
ccsettings list
```

#### オプション
なし

#### 出力形式
```
📋 利用可能なビルトインテンプレート:

🔹 default
   基本的な権限設定
   デフォルトモード: default
   許可ルール数: 5
   拒否ルール数: 3

...
```

### ccsettings show

現在のプロジェクト設定を表示します。

```bash
ccsettings show
```

#### オプション
なし

#### 出力形式
```
📄 現在のClaude Code設定:

📍 設定ファイルパス: /project/.claude/settings.json

🔐 権限設定:
   デフォルトモード: acceptEdits
   許可ルール:
     ✅ Read(src/**)
   拒否ルール:
     ❌ Bash(rm -rf *)

🌍 環境変数:
   NODE_ENV: development
```

## プログラマティック API

TypeScript/JavaScript から直接利用可能な API です。

### loadTemplate()

```typescript
import { loadTemplate } from 'ccsettings/core/loader';

async function loadTemplate(
  templateName?: string,
  filePath?: string,
  url?: string
): Promise<Template>
```

#### パラメータ
- `templateName`: ビルトインテンプレート名
- `filePath`: ローカルファイルパス
- `url`: テンプレートURL

#### 戻り値
```typescript
interface Template {
  name: string;
  description: string;
  settings: ClaudeSettings;
}
```

#### 使用例
```typescript
// ビルトインテンプレート
const template = await loadTemplate('development');

// ローカルファイル
const template = await loadTemplate(undefined, './template.json');

// URL
const template = await loadTemplate(undefined, undefined, 'https://...');
```

### mergeSettings()

```typescript
import { mergeSettings } from 'ccsettings/core/merger';

function mergeSettings(
  existing: ClaudeSettings | null,
  template: ClaudeSettings
): ClaudeSettings
```

#### パラメータ
- `existing`: 既存の設定（nullの場合は新規作成）
- `template`: 適用するテンプレート設定

#### 戻り値
マージされた設定オブジェクト

#### 使用例
```typescript
const existing = await readSettings();
const template = await loadTemplate('development');
const merged = mergeSettings(existing, template.settings);
```

### readSettings() / writeSettings()

```typescript
import { readSettings, writeSettings } from 'ccsettings/core/settings';

async function readSettings(): Promise<ClaudeSettings | null>
async function writeSettings(settings: ClaudeSettings): Promise<void>
```

#### 使用例
```typescript
// 設定読み込み
const currentSettings = await readSettings();

// 設定書き込み
const newSettings = { permissions: { defaultMode: 'acceptEdits' } };
await writeSettings(newSettings);
```

## 型定義

### ClaudeSettings

```typescript
interface ClaudeSettings {
  permissions?: {
    allow?: string[];
    deny?: string[];
    additionalDirectories?: string[];
    defaultMode?: 'default' | 'acceptEdits' | 'plan' | 'bypassPermissions';
    disableBypassPermissionsMode?: 'disable';
  };
  env?: Record<string, string>;
  includeCoAuthoredBy?: boolean;
  cleanupPeriodDays?: number;
  model?: string;
  hooks?: Record<string, Record<string, string>>;
  [key: string]: unknown;
}
```

### Template

```typescript
interface Template {
  name: string;
  description: string;
  settings: ClaudeSettings;
}
```

### ApplyOptions

```typescript
interface ApplyOptions {
  template?: string;
  file?: string;
  url?: string;
  dryRun?: boolean;
  backup?: boolean;
  force?: boolean;
}
```

## エラータイプ

### テンプレート関連エラー

```typescript
// ビルトインテンプレートが見つからない
class BuiltinTemplateNotFoundError extends Error {
  constructor(name: string)
}

// ファイルが見つからない
class TemplateFileNotFoundError extends Error {
  constructor(path: string)
}

// URL取得エラー
class TemplateUrlError extends Error {
  constructor(url: string, cause: string)
}

// JSON形式エラー
class InvalidJsonError extends Error {
  constructor(source: string)
}

// スキーマバリデーションエラー
class ValidationError extends Error {
  constructor(errors: string[])
}
```

### 設定ファイル関連エラー

```typescript
// 設定ディレクトリが見つからない
class SettingsDirectoryNotFoundError extends Error {}

// 設定ファイル書き込み権限エラー
class SettingsWritePermissionError extends Error {
  constructor(path: string)
}
```

## 設定パス解決

### findClaudeDirectory()

```typescript
async function findClaudeDirectory(): Promise<string | null>
```

現在のディレクトリから上位に向かって `.claude` ディレクトリを検索します。

#### アルゴリズム
1. 現在のディレクトリに `.claude` があるかチェック
2. なければ親ディレクトリに移動
3. ルートディレクトリまで繰り返し
4. 見つからなければ `null` を返す

### getSettingsPath()

```typescript
async function getSettingsPath(): Promise<string>
```

設定ファイルの絶対パスを取得します。`.claude` ディレクトリが存在しない場合は作成します。

## GitHub URL 変換

### convertGitHubUrl()

```typescript
function convertGitHubUrl(url: string): string
```

GitHub blob URL を raw URL に変換します。

#### 変換例
```
入力: https://github.com/user/repo/blob/main/template.json
出力: https://raw.githubusercontent.com/user/repo/main/template.json
```

## バックアップ機能

### createBackup()

```typescript
async function createBackup(): Promise<string>
```

現在の設定ファイルのバックアップを作成し、バックアップファイルパスを返します。

#### ファイル名形式
```
settings.backup-2024-01-01T12-00-00-000Z.json
```

## スキーマバリデーション

Zod を使用したランタイムバリデーションを提供します。

### TemplateSchema

```typescript
import { TemplateSchema } from 'ccsettings/schemas';

const template = TemplateSchema.parse(jsonData);
```

### ClaudeSettingsSchema

```typescript
import { ClaudeSettingsSchema } from 'ccsettings/schemas';

const settings = ClaudeSettingsSchema.parse(settingsData);
```