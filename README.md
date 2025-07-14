# ccsettings

Claude Code設定テンプレートをプロジェクト単位で適用するCLIツール

## インストール

```bash
npm install -g ccsettings
# or
pnpm add -g ccsettings
# or
yarn global add ccsettings
```

## 使い方

### テンプレートを適用

デフォルトテンプレートを適用：
```bash
ccsettings apply
```

特定のプリセットテンプレートを適用：
```bash
ccsettings apply --template strict
```

ローカルファイルからテンプレートを適用：
```bash
ccsettings apply --file ./my-template.json
```

URLからテンプレートを適用：
```bash
ccsettings apply --url https://example.com/template.json
```

### その他のコマンド

利用可能なテンプレートを表示：
```bash
ccsettings list
```

現在の設定を表示：
```bash
ccsettings show
```

### オプション

- `--dry-run` - 実際の変更を行わずに結果をプレビュー
- `--backup` - 変更前の設定をバックアップ
- `--force` - 確認なしで上書き

## ビルトインテンプレート

### default
基本的な権限設定。開発に必要な最小限の権限を許可します。

### strict
厳格なセキュリティ設定。コードの読み書きのみを許可し、コマンド実行やWeb取得を禁止します。

### development
開発環境向けの緩い設定。ローカル開発に必要な幅広い権限を許可します。

### testing
テスト実行に特化した設定。テストツールの実行とテストファイルの編集を許可します。

## テンプレート形式

カスタムテンプレートは以下の形式で作成します：

```json
{
  "name": "my-template",
  "description": "カスタムテンプレートの説明",
  "settings": {
    "permissions": {
      "allow": [
        "Read(src/**)",
        "Edit(src/**)",
        "Bash(npm run test:*)"
      ],
      "deny": [
        "Bash(rm -rf *)",
        "Edit(.env*)"
      ],
      "defaultMode": "default"
    }
  }
}
```

## マージ戦略

既存の設定ファイルがある場合、以下のルールでマージされます：

1. 配列（allow/deny）は重複を除いてマージ
2. プリミティブ値（defaultMode）は既存設定を優先
3. 存在しないフィールドはテンプレートから追加

## ライセンス

MIT