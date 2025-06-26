# 工場設備管理アプリプロトタイプ

このプロジェクトは、AI-Driven Development を活用した工場設備管理システムのプロトタイプです。

## 🏭 プロジェクト概要

工場内の設備の稼働状況やメンテナンス情報を一元管理し、効率的な運用をサポートするWebアプリケーションです。

### 主な機能
- **リアルタイム設備監視**: センサーデータによる稼働状況の監視
- **メンテナンス管理**: 予防保全とスケジュール管理
- **データ分析**: AI を活用した故障予測と効率分析
- **ダッシュボード**: 重要な指標の可視化

### 技術スタック
- **フロントエンド**: Vue.js 3 + Vue Router
- **バックエンド**: Python + FastAPI + Azure Functions
- **データベース**: Azure SQL Database + Azure Cosmos DB
- **分析**: Power BI + 機械学習
- **インフラ**: Microsoft Azure

## 📁 プロジェクト構造

```
factory-equipment-manager/
├── frontend/           # Vue.js アプリケーション
├── backend/           # Python API & Azure Functions
├── infrastructure/    # Azure リソース設定
├── docs/             # ドキュメント
└── プロジェクト概要.md # 詳細な概要説明
```

## 🚀 クイックスタート

### 1. フロントエンド開発環境の構築
```bash
cd frontend
npm install
npm run serve
```

### 2. バックエンド開発環境の構築
```bash
cd backend
pip install -r requirements.txt
cd api
uvicorn main:app --reload
```

### 3. Azure環境のセットアップ
[Azure環境構築ガイド](./docs/azure-setup.md)を参照してください。

## 📖 ドキュメント

- [📋 プロジェクト概要](./プロジェクト概要.md) - 詳細な機能説明
- [⚙️ Azure環境構築](./docs/azure-setup.md) - Azureリソースの作成手順
- [🚀 デプロイ手順](./docs/deployment.md) - 本番環境へのデプロイ
- [👥 ユーザーガイド](./docs/user-guide.md) - システムの使用方法

## 🎯 開発方針

このプロジェクトは **AI-Driven Development** の手法を採用しています：

1. **要件定義**: AIアシスタントとの対話による要件の整理
2. **設計**: システム構成とUIの検討
3. **実装**: コード生成とレビューの効率化
4. **テスト**: 自動テスト生成とデバッグ支援
5. **運用**: 監視とメンテナンスの自動化

## 🌟 特徴

- **初心者フレンドリー**: Azure初心者でも実行できる詳細な手順書
- **実践的な構成**: 実際の工場環境を想定した機能設計
- **スケーラブル**: Azure クラウドによる柔軟なスケーリング
- **AI活用**: 故障予測と効率改善の提案機能

## 📝 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 🤝 コントリビューション

プルリクエストやイシューの報告を歓迎します。開発に参加する際は、以下のガイドラインに従ってください：

1. Fork このリポジトリ
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📞 サポート

質問やサポートが必要な場合は、以下の方法でお問い合わせください：

- GitHub Issues でのバグ報告・機能要望
- ディスカッションでの質問・相談

---

🏭 **工場DXの第一歩を、AIと一緒に始めましょう！**
