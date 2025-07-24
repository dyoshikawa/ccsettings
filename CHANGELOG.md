# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-01-01

### Added

- 初回リリース
- 4つのビルトインテンプレート（default, strict, development, testing）
- テンプレート適用機能（`apply`コマンド）
- テンプレート一覧表示機能（`list`コマンド）
- 現在設定表示機能（`show`コマンド）
- スマートマージ機能（既存設定優先、配列重複除去、深いマージ）
- ローカルファイルテンプレート対応
- URL テンプレート対応（GitHub URL自動変換機能含む）
- ドライラン機能（`--dry-run`オプション）
- バックアップ機能（`--backup`オプション）
- 強制適用機能（`--force`オプション）
- 日本語UI対応
- Claude Code設定スキーマバリデーション
- 包括的なテストスイート（単体テスト・統合テスト）

### Technical Details

- TypeScript + Commander.js + Zod アーキテクチャ
- Lodash-es による効率的なオブジェクトマージ
- Node.js fetch API による URL テンプレート取得
- Vitest によるテスト環境
- Biome + ESLint + oxlint による品質管理
- TSup による高速ビルド