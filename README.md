# ccsettings - Claude Code Settings Manager

Claude Code設定テンプレートをプロジェクト単位で適用するCLIツールです。開発者がプロジェクトの`.claude/settings.json`に対して、標準的な設定テンプレートを適用し、既存設定との賢いマージを実現します。

## 特徴

- 🎯 **4つのビルトインテンプレート**: default, strict, development, testing
- 🔗 **複数の設定ソース**: ビルトイン、ローカルファイル、URL（GitHub対応）
- 🧠 **スマートマージ**: 既存設定を優先しつつテンプレートを統合
- 🔍 **プレビュー機能**: dry-runで変更内容を事前確認
- 💾 **バックアップ機能**: 変更前の設定を自動保存
- 🎨 **日本語UI**: 分かりやすい日本語メッセージ

## インストール

```bash
npm install -g ccsettings
# または
pnpm add -g ccsettings
# または
yarn global add ccsettings
```

## 基本的な使い方

### 1. 利用可能なテンプレートを確認

```bash
ccsettings list
```

### 2. テンプレートを適用（ドライラン）

```bash
ccsettings apply --template development --dry-run
```

### 3. テンプレートを適用

```bash
ccsettings apply --template development
```

### 4. 現在の設定を確認

```bash
ccsettings show
```

## ビルトインテンプレート

### default
基本的な権限設定。一般的な開発作業に適用。

```bash
ccsettings apply --template default
```

### strict  
厳格なセキュリティ設定。制限の多い環境で使用。

```bash
ccsettings apply --template strict
```

### development
開発環境向けの緩い設定。幅広い操作を許可。

```bash
ccsettings apply --template development
```

### testing
テスト実行に特化した設定。テストファイルの編集を中心に許可。

```bash
ccsettings apply --template testing
```

## コマンドリファレンス

### apply コマンド

テンプレートを現在のプロジェクトに適用します。

```bash
ccsettings apply [options]
```

#### オプション

- `-t, --template <name>` - ビルトインテンプレートを指定
- `-f, --file <path>` - ローカルファイルからテンプレートを読み込み
- `-u, --url <url>` - URLからテンプレートを取得
- `--dry-run` - 実際の変更を行わずにプレビューのみ表示
- `--backup` - 変更前の設定をバックアップ
- `--force` - 確認なしで変更を適用

#### 使用例

```bash
# デフォルトテンプレートを適用
ccsettings apply

# 開発環境テンプレートを適用
ccsettings apply --template development

# ローカルファイルからテンプレートを適用
ccsettings apply --file ./my-template.json

# GitHub URLからテンプレートを適用
ccsettings apply --url https://github.com/user/repo/blob/main/template.json

# バックアップ付きで強制適用
ccsettings apply --template strict --backup --force

# ドライランで変更内容をプレビュー
ccsettings apply --template development --dry-run
```

### list コマンド

利用可能なビルトインテンプレートを一覧表示します。

```bash
ccsettings list
```

### show コマンド

現在のプロジェクトの設定内容を表示します。

```bash
ccsettings show
```

## テンプレートファイル形式

カスタムテンプレートは以下のJSON形式で作成できます：

```json
{
  "name": "my-template",
  "description": "カスタムテンプレートの説明",
  "settings": {
    "permissions": {
      "allow": [
        "Read(src/**)",
        "Edit(src/**)",
        "Bash(npm run test)"
      ],
      "deny": [
        "Bash(rm -rf *)",
        "Write(/etc/**)"
      ],
      "defaultMode": "acceptEdits"
    },
    "env": {
      "NODE_ENV": "development",
      "DEBUG": "true"
    }
  }
}
```

## マージ戦略

ccsettingsは以下の戦略で既存設定とテンプレートをマージします：

1. **既存設定優先**: 既存の設定値は保持されます
2. **配列マージ**: `allow`や`deny`などの配列は重複を除いて結合
3. **深いマージ**: ネストしたオブジェクトも再帰的にマージ
4. **新規追加**: テンプレートにあって既存設定にない項目は追加

### マージ例

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
    "allow": ["Read(src/**)", "Edit(src/**)"],
    "deny": ["Bash(rm -rf *)"],
    "defaultMode": "default"
  }
}
```

マージ結果:
```json
{
  "permissions": {
    "allow": ["Read(src/**)", "Edit(src/**)"],
    "deny": ["Bash(rm -rf *)"],
    "defaultMode": "acceptEdits"
  }
}
```

## GitHub URL対応

GitHub上のテンプレートファイルは自動的にrawファイルURLに変換されます：

```bash
# 以下のような通常のGitHub URLが...
ccsettings apply --url https://github.com/user/repo/blob/main/template.json

# 自動的にraw URLに変換される
# https://raw.githubusercontent.com/user/repo/main/template.json
```

## エラーハンドリング

- 📁 ファイルが見つからない場合は分かりやすいエラーメッセージを表示
- 🔍 JSON形式が不正な場合は具体的な問題箇所を指摘
- 🌐 ネットワークエラーは適切にハンドリング
- ✅ テンプレートスキーマのバリデーション

## ライセンス

MIT

## 貢献

プルリクエストやIssueは歓迎です。バグ報告や機能要望がございましたら、[GitHub Issues](https://github.com/dyoshikawa/ccsettings/issues)までお願いします。

## 関連リンク

- [Claude Code公式ドキュメント](https://docs.anthropic.com/en/docs/claude-code)
- [Claude Code設定リファレンス](https://docs.anthropic.com/en/docs/claude-code/settings)