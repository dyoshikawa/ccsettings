---
root: false
targets: ["*"]
description: "Claude Code Settings: permissions.allow と permissions.deny の仕様"
globs: ["**/*"]
---

# Claude Code Settings: permissions.allow と permissions.deny の仕様

## 概要

`permissions.allow` と `permissions.deny` は、Claude Codeの設定ファイル（settings.json）で使用できる権限制御の配列です。

- **permissions.allow**: Claudeがユーザーに確認せずに実行できるツール権限のルールリスト
- **permissions.deny**: 常に拒否されるルールのリスト（allowルールよりも優先される）

## 設定ファイルの階層と優先順位

settings.jsonファイルは複数のレベルに配置でき、以下の順序でマージされます：

1. エンタープライズ管理ポリシー
2. コマンドラインフラグ
3. プロジェクトローカルの上書き設定（`.claude/settings.local.json`）
4. 共有プロジェクト設定（`.claude/settings.json`）
5. ユーザー設定（`~/.claude/settings.json`）

## ルールの構文

各エントリは以下の形式の文字列です：

```
ToolName(optional-specifier)
```

- ツール名のみを記述した場合、そのツールへのすべての呼び出しにマッチします（例：`"Bash"`）
- 一部のツールは、より細かい制御のために括弧内に指定子をサポートします：
  - `Bash("exact command")` または `Bash("prefix:*")`
  - `Read(path-pattern)` / `Edit(path-pattern)`（git-ignoreスタイルのグロブ）
  - `WebFetch(domain:example.com)`
  - `mcp__server` または `mcp__server__tool`（Model-Context-Protocolツール用）

## 実行時の決定エンジンの動作

1. Claudeは「このツール呼び出しは、アクティブな設定ファイルのいずれかの`permissions.deny`ルールにマッチするか？」を確認
   - Yes → 即座に拒否（ユーザープロンプトなし）
2. そうでない場合、「`permissions.allow`ルールにマッチするか？」を確認
   - Yes → 自動承認（プロンプトなし）※制限的なグローバルモードが強制されていない限り
3. そうでない場合、現在の`defaultMode`にフォールバック：
   - `default`: 各ツール/コマンドの初回使用時にプロンプト
   - `acceptEdits`: ファイル編集は自動承認、コマンドはプロンプト
   - `plan`: 分析のみ、編集とコマンドは拒否
   - `bypassPermissions`: すべてのプロンプトをスキップ（ポリシーで無効化可能）

## 有用な詳細とヒント

- `/permissions` REPLコマンドまたは「Allowed Tools」UIを使用して、マージされたルールセットと各ルールの出所を確認できます
- `Read()`/`Edit()`内のパターンは、settings.jsonファイルを含むディレクトリからの相対パスで解決されます
  - 絶対パスには`"//"`を使用
  - ホームディレクトリには`"~/"`を使用
- `additionalDirectories`を`allow`/`deny`と並べて記載することで、Claudeの読み取りスコープを拡張できます（ファイル編集ルールは引き続き適用されます）
- リポジトリで`bypassPermissions`の有効化を絶対に防ぐ必要がある場合は、`"disableBypassPermissionsMode": "disable"`を含むmanaged-settings.jsonを配布します

## 設定例

```jsonc
{
  "permissions": {
    "allow": [
      "Bash(npm run test:*)",          // 任意のnpmテストスクリプト
      "Read(src/**)",                  // srcディレクトリ内のファイル読み取り
      "WebFetch(domain:api.example.com)" // 特定ドメインへのWebアクセス
    ],
    "deny": [
      "Bash(rm -rf *)",                // 破壊的なコマンドをブロック
      "Bash(curl:*)",                  // 任意のネットワーク呼び出しを禁止
      "Edit(package-lock.json)"        // このファイルの編集を禁止
    ],
    "defaultMode": "acceptEdits"
  }
}
```

## 実践的な使用方法

- チームが快適に使えるallowルールを含む安全な共有settings.jsonをコミット
- 必要に応じてエンタープライズポリシーでより厳格なdenyルールを追加
- 個々の開発者は、隔離された環境で作業する際に個人の`.claude/settings.local.json`で設定を緩和可能