---
root: true
targets: ['*']
description: "project overview and architecture guide"
globs: ["**/*"]
---

# ccsettings - Claude Code Settings Manager

## プロジェクト概要

**ccsettings**は、Claude Code設定テンプレートをプロジェクト単位で適用するCLIツールです。開発者がプロジェクトの`.claude/settings.json`に対して、標準的な設定テンプレートを適用し、既存設定との賢いマージを実現します。

## 主要機能

1. **テンプレート適用**: プリセット、ローカルファイル、URLからテンプレートを適用
2. **スマートマージ**: 既存設定を優先しつつ、テンプレート設定を統合
3. **プリセット管理**: ビルトイン設定テンプレート（default/strict/development/testing）
4. **設定表示**: 現在の設定状態の確認
5. **バックアップ**: 変更前の設定の自動保存

## アーキテクチャ

### 技術スタック
- **言語**: TypeScript
- **CLIフレームワーク**: Commander.js  
- **バリデーション**: Zod（設定スキーマ検証）
- **HTTPクライアント**: Node.js fetch API
- **ユーティリティ**: lodash-es（tree-shaking対応）

### プロジェクト構成
```
├── src/              # ソースコード（現在未実装）
├── CLAUDE.md         # プロジェクト指針
├── SPEC.md           # 詳細仕様書
├── package.json      # パッケージ設定
├── tsconfig.json     # TypeScript設定
├── biome.json        # コード品質設定
└── vitest.config.ts  # テスト設定
```

### 設定ファイル形式
```json
{
  "name": "template-name",
  "description": "テンプレートの説明", 
  "settings": {
    "permissions": {
      "allow": ["Read(src/**)"],
      "deny": ["Bash(rm -rf *)"],
      "defaultMode": "acceptEdits"
    }
  }
}
```

## コマンド仕様

### 基本コマンド
- `ccsettings apply` - デフォルトテンプレート適用
- `ccsettings apply --template <name>` - 指定プリセット適用  
- `ccsettings apply --file <path>` - ローカルファイル適用
- `ccsettings apply --url <url>` - URL適用
- `ccsettings list` - 利用可能テンプレート一覧
- `ccsettings show` - 現在設定表示

### 重要オプション
- `--dry-run` - 変更プレビュー
- `--backup` - 設定バックアップ  
- `--force` - 確認なしで実行

## マージ戦略

1. **既存設定優先**: 既存の`.claude/settings.json`の値を保持
2. **配列マージ**: 重複除去して結合
3. **オブジェクト深マージ**: ネストしたオブジェクトも適切に統合
4. **プリミティブ値保護**: 既存のプリミティブ値は変更しない

## 開発状況

**現在の状態**: 初期セットアップ完了、実装準備段階
- ✅ プロジェクト構造設定
- ✅ 開発環境構築（TypeScript, Biome, ESLint, Vitest）
- ✅ 仕様書作成
- 🚧 実装中（src/ディレクトリは空）

## 品質保証

- **Linting**: Biome + ESLint + oxlint
- **型チェック**: TypeScript strict mode
- **テスト**: Vitest with coverage
- **セキュリティ**: secretlint
- **スペルチェック**: cspell
