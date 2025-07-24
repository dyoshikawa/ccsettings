# ccsettings CLI仕様書

## 概要
Claude Code設定テンプレートをプロジェクト単位で適用するCLIツール。

## 基本要件

### スコープ
- **適用範囲**: プロジェクト単位（`.claude/settings.json`を対象）
- **動作**: 既存設定を優先しつつテンプレート設定をマージ
- **UI**: 非インタラクティブ（コマンドライン引数で制御）

### 主要機能
1. テンプレート設定をプロジェクトの`.claude/settings.json`に適用
   - プリセットテンプレート
   - ローカルファイルからのテンプレート
   - URLからのテンプレート（GitHub等）
2. 既存設定がある場合は、既存設定を優先しながらマージ
3. 利用可能なプリセットテンプレートのリスト表示

## コマンド設計

### 基本コマンド
```bash
# デフォルトテンプレートを適用
ccsettings apply

# 特定のプリセットテンプレートを適用
ccsettings apply --template <template-name>

# ローカルファイルからテンプレートを適用
ccsettings apply --file <path-to-template>

# URLからテンプレートを適用（GitHub等）
ccsettings apply --url <template-url>

# 利用可能なプリセットテンプレートをリスト表示
ccsettings list

# 現在の設定を表示
ccsettings show
```

### オプション
- `--dry-run`: 実際の変更を行わずに結果をプレビュー
- `--backup`: 変更前の設定をバックアップ
- `--force`: 確認なしで上書き（デフォルトは確認あり）

## テンプレート仕様

### ビルトインテンプレート
1. **default**: 基本的な権限設定
2. **strict**: 厳格なセキュリティ設定
3. **development**: 開発環境向けの緩い設定
4. **testing**: テスト実行に特化した設定

### テンプレート形式
```json
{
  "name": "template-name",
  "description": "テンプレートの説明",
  "settings": {
    "permissions": {
      "allow": [],
      "deny": [],
      "defaultMode": "default"
    }
  }
}
```

### バリデーションスキーマ（Zod/mini）
```typescript
import * as z from 'zod/mini';

const PermissionsSchema = z.object({
  allow: z.optional(z.array(z.string())),
  deny: z.optional(z.array(z.string())),
  defaultMode: z.optional(z.enum(['default', 'acceptEdits', 'plan', 'bypassPermissions']))
});

const SettingsSchema = z.object({
  permissions: z.optional(PermissionsSchema)
});

const TemplateSchema = z.object({
  name: z.string(),
  description: z.string(),
  settings: SettingsSchema
});
```

## マージ戦略

### 基本ルール
1. 既存の設定ファイルが存在する場合、その値を優先
2. 配列の場合は重複を除いてマージ
3. オブジェクトの場合は深くマージ
4. プリミティブ値は既存設定を優先

### 例
既存設定:
```json
{
  "permissions": {
    "allow": ["Read(src/**)"],
    "defaultMode": "acceptEdits"
  }
}
```

テンプレート:
```json
{
  "permissions": {
    "allow": ["Bash(npm run test:*)"],
    "deny": ["Bash(rm -rf *)"],
    "defaultMode": "default"
  }
}
```

マージ結果:
```json
{
  "permissions": {
    "allow": ["Read(src/**)", "Bash(npm run test:*)"],
    "deny": ["Bash(rm -rf *)"],
    "defaultMode": "acceptEdits"  // 既存設定を優先
  }
}
```

## エラーハンドリング
- 設定ファイルの形式が不正な場合はエラー
- マージ競合が解決できない場合は警告を表示
- 書き込み権限がない場合は適切なエラーメッセージ

## 実装詳細

### 技術スタック
- **言語**: TypeScript
- **CLIフレームワーク**: Commander.js
- **バリデーション**: Zod/mini（バンドルサイズ最適化）
- **HTTPクライアント**: Node.js標準のfetch API
- **ファイル操作**: Node.js fs/promises API
- **JSONマージ**: lodash-es（tree-shaking対応）
- **ユーティリティ**: lodash-esの個別インポート

### 主要な依存関係

- commander+ink
- lodash-es
- zod

## URL対応の詳細

### サポートするURL形式
- GitHubの生ファイルURL: `https://raw.githubusercontent.com/...`
- GitHubの通常URL（自動変換）: `https://github.com/.../blob/.../file.json`
- その他のHTTPS URL
