# 謎解きイベント記録アプリ

Google Spreadsheetのデータをブログのように表示するWebアプリケーションです。謎解きイベントの記録を管理・検索・閲覧できます。

## 機能

- **パスワード認証**: 環境変数で設定したパスワードによるアクセス制御
- **データ表示**: Google Spreadsheetからのデータ取得と表形式での表示
- **ページング**: 30行ずつのページ分割表示
- **フィルタリング**: 形式（謎解きの種類）による絞り込み
- **検索機能**: 
  - テキスト検索: タイトル・団体名から検索
  - 内容検索: ストーリー・印象的なこと・ラス謎から検索
- **詳細ページ**: 各イベントの個別詳細表示
- **団体フィルタ**: 団体名クリックでその団体のイベントのみ表示

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **データソース**: Google Sheets API
- **認証**: Cookie ベース認証
- **デプロイ**: Vercel

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
# パスワード認証用
APP_PASSWORD=your_secret_password_here

# Google Sheets API設定
GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key
GOOGLE_SHEET_ID=your_google_sheet_id

# NextAuth設定
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### 3. Google Sheets API の設定

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. Google Sheets API を有効化
3. APIキーを作成し、`GOOGLE_SHEETS_API_KEY` に設定
4. スプレッドシートのIDを `GOOGLE_SHEET_ID` に設定

### 4. スプレッドシートの構成

スプレッドシートは以下の列構成である必要があります（A列からH列）：

| 列 | 項目名 | 説明 |
|---|---|---|
| A | タイムスタンプ | 記録日時 |
| B | 参加日 | イベント参加日 |
| C | タイトル | イベント名 |
| D | 団体 | 主催団体名 |
| E | 形式 | 謎解きの形式 |
| F | ストーリー | イベントのストーリー |
| G | 印象的なこと | 印象に残ったこと |
| H | ラス謎 | 最終問題について |

## 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

## ビルド

```bash
npm run build
```

## Vercelへのデプロイ

### 自動デプロイの設定

1. GitHubリポジトリをVercelに接続
2. 環境変数を Vercel のダッシュボードで設定：
   - `APP_PASSWORD`
   - `GOOGLE_SHEETS_API_KEY`
   - `GOOGLE_SHEET_ID`
   - `NEXTAUTH_SECRET`

3. `main` ブランチへのプッシュで自動デプロイが実行されます

### GitHub Actions による自動デプロイ（オプション）

リポジトリの Secrets に以下を設定：
- `VERCEL_TOKEN`: Vercel のアクセストークン
- `ORG_ID`: Vercel の組織ID
- `PROJECT_ID`: Vercel のプロジェクトID

## 使用方法

1. アプリケーションにアクセス
2. 設定したパスワードでログイン
3. ダッシュボードでイベント一覧を確認
4. フィルターや検索を使用してイベントを絞り込み
5. タイトルをクリックして詳細ページを表示
6. 団体名をクリックしてその団体のイベントのみ表示

## ライセンス

MIT License
