---
root: true
targets: ['*']
description: "project overview and architecture guide"
globs: ["**/*"]
---

# ccsettings - Claude Code Settings Manager

## プロジェクト概要

**ccsettings** は、Claude Code の設定テンプレートをプロジェクト単位で適用するためのCLIツールです。プロジェクトの `.claude/settings.json` ファイルに対して、標準化された設定テンプレートの適用と既存設定との賢い統合を実現します。

## 主要機能

- **テンプレート適用**: プリセット、ローカルファイル、URLからテンプレートを適用
- **スマートマージ**: 既存設定を保持しながらテンプレート設定を統合
- **プリセット管理**: 組み込み設定テンプレート（default/strict/development/testing）
- **設定表示**: 現在の設定状態の確認
- **バックアップ**: 変更前の設定の自動保存

## 技術スタック

- **言語**: TypeScript (Node.js v20+)
- **CLIフレームワーク**: Commander.js
- **バリデーション**: Zod (設定スキーマ検証)
- **HTTPクライアント**: Node.js fetch API
- **ユーティリティ**: lodash-es (tree-shaking対応)

## プロジェクト構造

```
src/
├── cli/                    # CLIインターフェース
│   ├── commands/          # コマンド実装
│   │   ├── apply.ts      # テンプレート適用コマンド
│   │   ├── list.ts       # テンプレート一覧コマンド
│   │   └── show.ts       # 設定表示コマンド
│   ├── index.ts          # CLIエントリポイント
│   └── main.ts           # メインプログラム
├── core/                  # 核心機能
│   ├── loader.ts         # テンプレートローダー
│   ├── merger.ts         # 設定マージ機能
│   └── settings.ts       # 設定管理
├── schemas/              # データスキーマ
│   └── index.ts          # Zodスキーマ定義
├── templates/            # テンプレート管理
│   └── builtin.ts        # 組み込みテンプレート
├── types/                # TypeScript型定義
│   └── index.ts          # 型定義
└── index.ts              # パッケージエントリポイント
```

## コマンド仕様

### 基本コマンド
- `ccsettings apply` - デフォルトテンプレートを適用
- `ccsettings apply --template <name>` - 指定したプリセットを適用
- `ccsettings apply --file <path>` - ローカルファイルから適用
- `ccsettings apply --url <url>` - URLから適用
- `ccsettings list` - 利用可能なテンプレート一覧
- `ccsettings show` - 現在の設定を表示

### 重要なオプション
- `--dry-run` - 変更の事前確認
- `--backup` - 設定のバックアップ
- `--force` - 確認なしで実行

## 設定ファイル形式

```json
{
  "name": "template-name",
  "description": "Template description",
  "settings": {
    "permissions": {
      "allow": ["Read(src/**)"],
      "deny": ["Bash(rm -rf *)"],
      "defaultMode": "acceptEdits"
    }
  }
}
```

## マージ戦略

1. **既存設定の優先**: 既存の `.claude/settings.json` の値を保持
2. **配列のマージ**: 重複を除去して結合
3. **深いオブジェクトマージ**: ネストしたオブジェクトを適切に統合
4. **プリミティブ値の保護**: 既存のプリミティブ値は変更しない

## 開発状況

**現在の状態**: v0.6.0 - 機能実装完了、継続的な改善中

- ✅ プロジェクト構造の設定
- ✅ 開発環境の構築 (TypeScript, Biome, ESLint, Vitest)
- ✅ 仕様書の作成
- ✅ 核心機能の実装 (CLI、テンプレート適用、マージ機能)
- ✅ テスト実装 (単体テスト、統合テスト)
- ✅ パッケージ公開準備

## 品質保証

- **リンティング**: Biome + ESLint + oxlint
- **型チェック**: TypeScript strict mode
- **テスト**: Vitest with coverage
- **セキュリティ**: secretlint
- **スペルチェック**: cspell

## パッケージ情報

- **バージョン**: 0.6.0
- **ライセンス**: MIT
- **リポジトリ**: https://github.com/dyoshikawa/ccsettings
- **Node.js要件**: >=20.0.0
- **パッケージマネージャー**: pnpm@10.12.2
