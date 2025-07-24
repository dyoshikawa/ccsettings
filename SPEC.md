# ccsettings

## 仕様

ユーザーのGitHubアカウントに関するあらゆるイベント（Issue起票、Issueコメント、Discussion作成、Discussionコメント、プルリクエスト作成、プルリクエストレビューコメント、Commit）を取得するCLIツール。
xmlファイルで出力する。

例:
```xml
<PullRequest createdAt="...">
...
</PullRequest>

<Commit createdAt="...">
...
</Commit>
```

### コマンド

#### npx ccsettings

デフォルトでは、Publicリポジトリにおける直近2週間のイベントを取得し、XMLファイル `./ccsettings.xml` を出力する。

オプション:

- --github-token: GitHubのアクセストークンを指定する。省略時は環境変数 `GITHUB_TOKEN` もしくは `gh auth token` の結果を参照する。
- --output: 出力ファイル名を指定する。省略時は `./ccsettings.xml` を使用する。
- --since: 取得するイベントの開始日時をISO8601形式で指定する。省略時は2週間前の日付を使用する。
- --until: 取得するイベントの終了日時をISO8601形式で指定する。省略時は現在日時を使用する。
- --visibility: 取得するリポジトリの可視性を指定する。`public`（デフォルト）、`private`、`all` のいずれかを指定する。
- --max-length: 出力するXMLファイルの最大長を指定する。省略時は50万文字以内。超えたらファイルを分割する。 `./ccsettings_1.xml`, `./ccsettings_2.xml` のように出力する。
- --order: 取得するイベントの順序を指定する。`asc`（デフォルト）または `desc` のいずれかを指定する。

## 技術選定

- Node.js
- TypeScript
- octokit/graphql（octokit/restは使用禁止）
- commander+ink
