# テンプレート仕様

## ビルトインテンプレート詳細

### default テンプレート

基本的な開発作業に適した標準的な権限設定です。

```json
{
  "name": "default",
  "description": "基本的な権限設定",
  "settings": {
    "permissions": {
      "allow": [
        "Read(src/**)",
        "Read(*.{js,ts,json,md})",
        "Edit(src/**)",
        "Bash(npm run lint)",
        "Bash(npm run test)"
      ],
      "deny": [
        "Bash(rm -rf *)",
        "Bash(sudo *)",
        "Write(/etc/**)"
      ],
      "defaultMode": "default"
    }
  }
}
```

**適用場面**: 一般的な開発プロジェクトの初期設定

### strict テンプレート

セキュリティを重視した厳格な権限設定です。

```json
{
  "name": "strict",
  "description": "厳格なセキュリティ設定",
  "settings": {
    "permissions": {
      "allow": [
        "Read(src/**)",
        "Read(*.md)"
      ],
      "deny": [
        "Bash(*)",
        "WebFetch(*)",
        "Write(*)",
        "Edit(*)"
      ],
      "defaultMode": "plan"
    }
  }
}
```

**適用場面**: 機密性の高いプロジェクト、読み取り専用の作業

### development テンプレート

開発作業を効率化する緩い権限設定です。

```json
{
  "name": "development",
  "description": "開発環境向けの緩い設定",
  "settings": {
    "permissions": {
      "allow": [
        "Read(**)",
        "Edit(src/**)",
        "Edit(*.{js,ts,json,md})",
        "Bash(npm run *)",
        "Bash(yarn *)",
        "Bash(git *)",
        "WebFetch(domain:github.com)",
        "WebFetch(domain:npmjs.com)"
      ],
      "deny": [
        "Bash(rm -rf *)",
        "Bash(sudo *)",
        "Edit(/etc/**)"
      ],
      "defaultMode": "acceptEdits"
    },
    "env": {
      "NODE_ENV": "development"
    }
  }
}
```

**適用場面**: アクティブな開発フェーズ、プロトタイピング

### testing テンプレート

テスト作業に特化した権限設定です。

```json
{
  "name": "testing",
  "description": "テスト実行に特化した設定",
  "settings": {
    "permissions": {
      "allow": [
        "Read(**)",
        "Edit(test/**)",
        "Edit(spec/**)",
        "Edit(*.test.*)",
        "Edit(*.spec.*)",
        "Bash(npm run test*)",
        "Bash(npm run lint)",
        "Bash(yarn test*)",
        "Bash(vitest *)",
        "Bash(jest *)"
      ],
      "deny": [
        "Edit(src/**)",
        "Bash(rm -rf *)",
        "Bash(sudo *)"
      ],
      "defaultMode": "acceptEdits"
    },
    "env": {
      "NODE_ENV": "test"
    }
  }
}
```

**適用場面**: テスト作成・修正フェーズ、QAレビュー

## カスタムテンプレート作成

### 基本構造

```json
{
  "name": "template-name",
  "description": "テンプレートの説明",
  "settings": {
    // Claude Code設定オブジェクト
  }
}
```

### サポートする設定項目

#### permissions
```json
{
  "permissions": {
    "allow": ["許可するツール・パターンの配列"],
    "deny": ["拒否するツール・パターンの配列"],
    "additionalDirectories": ["追加でアクセスを許可するディレクトリ"],
    "defaultMode": "default|acceptEdits|plan|bypassPermissions",
    "disableBypassPermissionsMode": "disable"
  }
}
```

#### env
```json
{
  "env": {
    "環境変数名": "値"
  }
}
```

#### その他の設定
```json
{
  "includeCoAuthoredBy": true,
  "cleanupPeriodDays": 30,
  "model": "claude-3-5-sonnet-20241022",
  "hooks": {
    "PreToolUse": {
      "Bash": "echo 'Running command...'"
    }
  }
}
```

### 権限パターン例

#### ファイル操作
- `Read(src/**)` - srcディレクトリ以下の読み取り
- `Edit(*.js)` - JavaScriptファイルの編集
- `Write(/tmp/**)` - tmpディレクトリへの書き込み

#### コマンド実行
- `Bash(npm run *)` - npm run コマンドの実行
- `Bash(git *)` - gitコマンドの実行
- `Bash(node:*)` - nodeコマンドの実行

#### Web アクセス
- `WebFetch(domain:github.com)` - GitHubへのアクセス
- `WebFetch(*)` - 全てのWebアクセス

### テンプレート配布

#### GitHub での配布
1. GitHubリポジトリにJSONファイルをアップロード
2. 通常のblobファイルURLで共有可能（自動変換される）

```bash
ccsettings apply --url https://github.com/user/repo/blob/main/my-template.json
```

#### ローカルファイル
```bash
ccsettings apply --file ./templates/my-custom.json
```

### ベストプラクティス

1. **明確な命名**: テンプレート名は用途が分かるように
2. **適切な説明**: descriptionフィールドで目的を説明
3. **最小権限**: 必要最小限の権限のみ付与
4. **環境変数活用**: 環境に応じた設定を環境変数で制御
5. **段階的適用**: strict → default → development の順で段階的に権限を拡張

### テンプレート検証

テンプレートファイルは自動的にスキーマ検証が行われます：

- ✅ 必須フィールド（name, description, settings）の存在確認
- ✅ 権限パターンの形式確認
- ✅ defaultModeの値検証
- ✅ 環境変数の形式確認

無効なテンプレートファイルは明確なエラーメッセージと共に拒否されます。