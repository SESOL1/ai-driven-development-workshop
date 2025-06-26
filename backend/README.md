# Backend - Python FastAPI アプリケーション

## 概要
工場設備管理システムのバックエンド部分です。FastAPIを使用してREST APIを提供し、Azure Functions でデータ処理を行います。

## 技術スタック
- **FastAPI**: REST API フレームワーク
- **SQLAlchemy**: ORM（Azure SQL Database用）
- **Azure Cosmos DB SDK**: NoSQL データベース接続
- **Azure Functions**: サーバーレス処理
- **Pandas/NumPy**: データ分析
- **Scikit-learn**: 機械学習

## ディレクトリ構成
```
backend/
├── api/                    # FastAPI アプリケーション
│   ├── main.py            # メインアプリケーション
│   ├── database.py        # データベース設定
│   ├── models/            # データモデル
│   ├── schemas/           # Pydantic スキーマ
│   ├── services/          # ビジネスロジック
│   └── routers/           # API ルーター
├── functions/             # Azure Functions
│   ├── data_processor/    # データ処理関数
│   ├── failure_predictor/ # 故障予測関数
│   └── alert_manager/     # アラート管理関数
├── models/                # 共通データモデル
├── requirements.txt       # Python依存関係
└── README.md             # このファイル
```

## セットアップ手順

### 1. Python 仮想環境の作成
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 2. 依存関係のインストール
```bash
pip install -r requirements.txt
```

### 3. 環境変数の設定
`.env` ファイルを作成し、以下の変数を設定：
```
# Database
SQL_CONNECTION_STRING=Server=tcp:your-server.database.windows.net,1433;Initial Catalog=your-db;...
COSMOS_CONNECTION_STRING=AccountEndpoint=https://your-cosmos.documents.azure.com:443/;...

# Azure Functions
AZURE_FUNCTIONS_ENVIRONMENT=Development
AzureWebJobsStorage=DefaultEndpointsProtocol=https;AccountName=your-storage;...

# API Settings
SECRET_KEY=your-secret-key
DEBUG=True
```

### 4. データベースの初期化
```bash
# データベーステーブルの作成
python -c "from api.database import create_tables; create_tables()"

# サンプルデータの投入（オプション）
python scripts/init_sample_data.py
```

### 5. 開発サーバーの起動
```bash
# FastAPI サーバーの起動
cd api
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Azure Functions の開発
```bash
# Azure Functions Core Tools のインストール
npm install -g azure-functions-core-tools@4 --unsafe-perm true

# Functions プロジェクトの初期化
cd functions
func init --python

# ローカルで Functions を実行
func start
```

## API エンドポイント

### 設備管理
- `GET /api/equipment` - 設備一覧取得
- `GET /api/equipment/{id}` - 設備詳細取得
- `PATCH /api/equipment/{id}/status` - 設備状態更新
- `GET /api/equipment/{id}/realtime` - リアルタイムデータ取得

### メンテナンス管理
- `GET /api/maintenance` - メンテナンス一覧取得
- `POST /api/maintenance` - メンテナンス登録
- `GET /api/maintenance/{id}` - メンテナンス詳細取得
- `PATCH /api/maintenance/{id}/status` - メンテナンス状態更新

### データ分析
- `GET /api/analytics/dashboard` - ダッシュボードデータ取得
- `GET /api/analytics/operation-rate` - 稼働率データ取得
- `GET /api/analytics/failure-prediction` - 故障予測データ取得
- `GET /api/analytics/kpi` - KPI データ取得

### WebSocket
- `WS /ws` - リアルタイムデータ配信

## Azure Functions

### 1. データ処理関数 (data_processor)
IoTデバイスからのデータを受信し、Cosmos DBに保存

### 2. 故障予測関数 (failure_predictor)
機械学習モデルを使用して設備の故障を予測

### 3. アラート管理関数 (alert_manager)
異常値を検知してアラートを送信

## データモデル

### Equipment（設備）
- equipment_id: 設備ID
- name: 設備名
- location: 設置場所
- status: 状態（running/stopped/warning/maintenance）
- temperature: 温度
- operating_hours: 稼働時間
- efficiency: 効率

### Maintenance（メンテナンス）
- maintenance_id: メンテナンスID
- equipment_id: 設備ID
- type: メンテナンス種別
- scheduled_date: 予定日
- status: 状態（scheduled/in-progress/completed/overdue）
- assignee: 担当者

### Analytics（分析データ）
- timestamp: タイムスタンプ
- equipment_id: 設備ID
- metrics: メトリクス（JSON）
- predictions: 予測データ（JSON）

## テスト実行
```bash
# 単体テスト
pytest tests/

# カバレッジ付きテスト
pytest --cov=api tests/

# 統合テスト
pytest tests/integration/
```

## デプロイ

### Azure App Service へのデプロイ
```bash
# Azure CLI でデプロイ
az webapp up --name your-webapp-name --resource-group your-rg --runtime "PYTHON|3.9"
```

### Azure Functions へのデプロイ
```bash
cd functions
func azure functionapp publish your-function-app-name
```

## 監視とログ

### Application Insights の設定
```python
from opencensus.ext.azure.log_exporter import AzureLogHandler
import logging

# Application Insights への接続設定
logger = logging.getLogger(__name__)
logger.addHandler(AzureLogHandler(connection_string='your-connection-string'))
```

### ヘルスチェック
- エンドポイント: `GET /health`
- レスポンス例:
```json
{
  "status": "healthy",
  "timestamp": "2024-03-15T10:30:00Z",
  "version": "1.0.0"
}
```

## トラブルシューティング

### よくある問題
1. **データベース接続エラー**
   - SQL Server のファイアウォール設定を確認
   - 接続文字列の形式を確認

2. **Azure Functions のローカル実行エラー**
   - Azure Functions Core Tools のバージョンを確認
   - ストレージアカウントの設定を確認

3. **CORS エラー**
   - フロントエンドのオリジンが許可されているか確認

## 次のステップ
1. [フロントエンドとの連携](../frontend/README.md)
2. [本番環境へのデプロイ](../docs/deployment.md)
3. [監視とメンテナンス](../docs/monitoring.md)