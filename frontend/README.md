# Frontend - Vue.js アプリケーション

## 概要
工場設備管理システムのフロントエンド部分です。Vue.js 3を使用して構築されています。

## 機能
- **ダッシュボード**: 設備の稼働状況をリアルタイムで監視
- **設備一覧**: 全設備の状態確認と制御
- **メンテナンス管理**: メンテナンススケジュールの管理
- **データ分析**: 設備データの可視化と分析結果の表示

## 技術スタック
- Vue.js 3
- Vue Router 4
- Axios (HTTP通信)
- WebSocket (リアルタイム通信)

## セットアップ手順

### 1. 依存関係のインストール
```bash
cd frontend
npm install
```

### 2. 開発サーバーの起動
```bash
npm run serve
```

### 3. 本番ビルド
```bash
npm run build
```

### 4. コードの品質チェック
```bash
npm run lint
```

## ディレクトリ構成
```
frontend/
├── public/
│   └── index.html          # メインHTMLファイル
├── src/
│   ├── components/         # 再利用可能なコンポーネント
│   ├── views/             # ページコンポーネント
│   │   ├── Dashboard.vue  # ダッシュボード
│   │   ├── Equipment.vue  # 設備一覧
│   │   ├── Maintenance.vue # メンテナンス管理
│   │   └── Analytics.vue  # データ分析
│   ├── router/            # ルーティング設定
│   │   └── index.js
│   ├── services/          # API通信サービス
│   │   └── api.js
│   ├── App.vue           # ルートコンポーネント
│   └── main.js           # エントリーポイント
├── package.json          # プロジェクト設定
└── README.md            # このファイル
```

## 環境変数
`.env`ファイルで以下の変数を設定してください：
```
VUE_APP_API_URL=http://localhost:8000/api
VUE_APP_WEBSOCKET_URL=ws://localhost:8000/ws
```

## 開発時の注意点
- コンポーネントの命名は PascalCase を使用
- CSSは scoped スタイルを使用
- API通信はservices/api.jsを経由して実行
- リアルタイムデータはWebSocketを使用

## デプロイ
本番環境へのデプロイは以下の手順で行います：
1. `npm run build` で本番用ファイルを生成
2. `dist/` ディレクトリの内容をWebサーバーにアップロード
3. Azure Static Web Apps またはAzure App Serviceを使用