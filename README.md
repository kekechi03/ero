# エンターテインメントレーティング機構ERO

エンターテインメントレーティング機構(ERO) - TypeScript + Next.js + Parse Server (Back4App)

## 機能

-  **評価**: 未鑑定の画像がランダムに選出され、エッチ/ノーエッチで鑑定していく
-  **アップロード**: 画像をドラッグ&ドロップしてアップロード(1MB未満)
-  **プロフィール**: 個人の鑑定履歴と傾向分析
-  **ランキング機能**: 一番Yesの多い画像とNoの多い画像を並べて表示
-  **管理者機能**: 画像の削除、アップロード可能な数制限の設定
-  **リアルタイム集計**: 鑑定後すぐに全体の鑑定統計を表示

## UIデザイン
- アンケート形式に特化した、ただしイラスト風のデザイン
- モバイル・PC両対応

## セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. Back4App設定
1. [Back4App](https://www.back4app.com/)でアカウント作成
2. 新しいアプリを作成
3. App Settings > Security & Keys から以下を取得:
   - Application ID
   - JavaScript Key
   - Server URL

### 3. 環境変数設定
`.env.local`ファイルを作成し、以下を設定:

```env
NEXT_PUBLIC_PARSE_APP_ID=your_app_id_here
NEXT_PUBLIC_PARSE_JS_KEY=your_javascript_key_here
NEXT_PUBLIC_PARSE_SERVER_URL=https://parseapi.back4app.com/
NEXT_PUBLIC_PARSE_LIVEQUERY_URL=wss://your-app-name.back4app.io/
```

### 4. Back4Appデータベース設定
1. Back4Appダッシュボードで以下のクラスを作成:

**EroImage**
- file (File) - 画像ファイル
- uploader (Pointer<_User>) - アップロード者
- yesCount (Number) - エッチ鑑定数
- noCount (Number) - ノーエッチ鑑定数

**Vote**
- image (Pointer<EroImage>) - 鑑定対象画像
- user (Pointer<_User>) - 鑑定者
- answer (Boolean) - Yes(true)/No(false)

2. CLPを設定:
   - EroImage: Public read, Admin write
   - Vote: User read (own records), Authenticated write

### 5. 管理者ユーザー作成
1. アプリを起動後、通常ユーザーでサインアップ
2. Back4Appダッシュボード > Database Browser > _User
3. 管理者にしたいユーザーに `isAdmin: true` フィールドを追加
   または `username: "admin"` に変更

### 6. 開発サーバー起動
```bash
npm run dev
```

http://localhost:3000 でアクセス

## デプロイ

### Vercel
```bash
# Vercel CLI インストール
npm i -g vercel

# デプロイ
vercel

# 環境変数を設定
vercel env add NEXT_PUBLIC_PARSE_APP_ID
vercel env add NEXT_PUBLIC_PARSE_JS_KEY
vercel env add NEXT_PUBLIC_PARSE_SERVER_URL
vercel env add NEXT_PUBLIC_PARSE_LIVEQUERY_URL
```

## 使い方

### 一般ユーザー
1. サインアップ/ログイン
2. 評価画面でランダム画像にYes/No鑑定
3. 鑑定後、全体の結果を確認
4. プロフィール画面で自分の傾向を分析
5. アップロード画面で画像をアップロード

### 管理者
1. 管理者権限でログイン
2. 不要な画像を削除

## 技術スタック

- **Frontend**: Next.js 13 + TypeScript + React
- **Backend**: Parse Server (Back4App)
- **Database**: MongoDB (Back4Appが提供)
- **File Storage**: Parse File (Back4Appが提供)
- **Auth**: Parse Authentication
- **Deploy**: Vercel + Back4App

## ディレクトリ構成

```
ero/
├── components/          # Reactコンポーネント
│   ├── AuthView.tsx    # 認証画面
│   ├── GameView.tsx    # 鑑定画面
│   ├── ProfileView.tsx # プロフィール画面
│   ├── UploadView.tsx # アップロード画面
│   └── AdminView.tsx   # 管理者画面
├── lib/
│   ├── parseClient.ts  # Parse SDK初期化
│   └── models.ts       # データモデル定義
├── pages/
│   ├── _app.tsx       # Next.jsアプリ設定
│   └── index.tsx      # メインページ
├── styles/
│   └── globals.css    # グローバルスタイル
└── package.json
```

## ライセンス

MIT License

## 設計注意点

- ファイルアップロードは日本語ファイル名可とする
