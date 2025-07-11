---
root: true
targets: ["*"]
description: "Project overview"
globs: ["**/*"]
---

# ccsettings Project Guide

## 概要
TypeScriptベースのライブラリプロジェクト。CommonJSとESMの両形式でビルド可能。

## 必須コマンド

### 開発
```bash
pnpm dev          # src/index.tsを実行（tsx使用）
pnpm build        # distディレクトリにビルド（CJS/ESM両対応）
```

### テスト
```bash
pnpm test         # Vitestでテスト実行
pnpm test:cov     # カバレッジ付きでテスト実行
```

### コード品質管理
```bash
pnpm lint         # 全てのリンター実行（Biome, OxLint, ESLint, TypeScript）
pnpm format       # Biomeでフォーマット

# 個別のリンター
pnpm lint:biome   # Biomeチェック（自動修正付き）
pnpm lint:oxlint  # OxLintチェック
pnpm lint:eslint  # ESLintチェック
pnpm lint:type    # TypeScript型チェック（tsgo使用）
pnpm cspell       # スペルチェック
```

## アーキテクチャ構成

### ディレクトリ構造
```
src/
  ├── index.ts      # エントリーポイント
dist/               # ビルド出力（gitignore）
  ├── index.js      # CommonJS形式
  ├── index.mjs     # ESM形式
  └── index.d.ts    # 型定義
```

### 技術スタック
- **言語**: TypeScript 5.8.3（ES2022ターゲット）
- **ビルドツール**: tsup（CommonJS/ESM両対応）
- **テストフレームワーク**: Vitest
- **フォーマッター**: Biome
- **リンター**: 
  - Biome（フォーマット専用、リンター機能は無効）
  - OxLint（高速なJavaScript/TypeScriptリンター）
  - ESLint（TypeScript専用ルール適用）
- **その他**: 
  - cspell（スペルチェック）
  - secretlint（機密情報チェック）

### 重要な設定

#### TypeScript設定（tsconfig.json）
- **strict**: true（厳格モード有効）
- **noUncheckedIndexedAccess**: true（配列アクセスの安全性確保）
- **moduleResolution**: bundler（バンドラー向け設定）
- **パスエイリアス**: `@/*` → `./src/*`

#### Git Hooks（自動実行）
pre-commitフックで以下が自動実行:
1. Biomeでのフォーマット
2. OxLintでの修正
3. ESLintでの修正
4. TypeScript型チェック
5. 変更されたテストファイルの実行
6. secretlintで機密情報チェック
7. cspellでスペルチェック

#### コードスタイル
- インデント: スペース2つ
- 引用符: シングルクォート
- セミコロン: 必要な場合のみ
- 行末カンマ: 有効
- 行幅: 80文字

## 開発フロー

1. **機能開発**
   ```bash
   pnpm dev          # 開発サーバー起動
   pnpm test         # テスト実行
   ```

2. **コミット前**
   - Git hooksが自動でリント・フォーマット実行
   - 手動で全体チェック: `pnpm lint`

3. **ビルド**
   ```bash
   pnpm build        # CommonJS/ESM両形式でビルド
   ```

## 注意事項
- Node.js 20以上が必要
- パッケージマネージャーはpnpmを使用
- Biomeのリンター機能は無効化されており、フォーマッターとしてのみ使用
- TypeScriptの型チェックは`tsgo`（TypeScriptのネイティブプレビュー版）を使用
