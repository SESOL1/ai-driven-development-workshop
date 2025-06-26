# アプリケーションデプロイ手順

## 概要
工場設備管理アプリケーションのデプロイ手順を説明します。Azure環境への段階的なデプロイを行います。

## 前提条件
1. [Azure環境のセットアップ](./azure-setup.md)が完了していること
2. Azure CLI がインストールされていること
3. Git リポジトリが設定されていること

## 手順1: バックエンドAPIのデプロイ

### Azure App Service へのデプロイ

```bash
# リポジトリのルートディレクトリに移動
cd /path/to/factory-equipment-manager

# Azure App Service にデプロイ
az webapp up \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --runtime "PYTHON|3.9" \
  --src-path ./backend/api

# アプリケーション設定の追加
az webapp config appsettings set \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    "SQL_CONNECTION_STRING=$SQL_CONNECTION_STRING" \
    "COSMOS_CONNECTION_STRING=$COSMOS_CONNECTION_STRING" \
    "SECRET_KEY=$(openssl rand -base64 32)"

# 起動コマンドの設定
az webapp config set \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --startup-file "python -m uvicorn main:app --host 0.0.0.0 --port 8000"
```

### デプロイの確認
```bash
# アプリケーションの状態確認
az webapp show \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "state"

# ログの確認
az webapp log tail \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP
```

## 手順2: Azure Functions のデプロイ

### Functions プロジェクトのデプロイ

```bash
# Functions ディレクトリに移動
cd backend/functions

# Functions App にデプロイ
func azure functionapp publish $FUNCTION_APP_NAME

# 設定の更新
az functionapp config appsettings set \
  --name $FUNCTION_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    "SQL_CONNECTION_STRING=$SQL_CONNECTION_STRING" \
    "COSMOS_CONNECTION_STRING=$COSMOS_CONNECTION_STRING"
```

### Functions の動作確認
```bash
# Functions の一覧表示
az functionapp function list \
  --name $FUNCTION_APP_NAME \
  --resource-group $RESOURCE_GROUP

# Functions のログ確認
az functionapp logs tail \
  --name $FUNCTION_APP_NAME \
  --resource-group $RESOURCE_GROUP
```

## 手順3: フロントエンドのデプロイ

### Static Web Apps へのデプロイ

```bash
# フロントエンドディレクトリに移動
cd frontend

# 依存関係のインストール
npm install

# 本番用ビルド
npm run build

# Static Web Apps CLI のインストール（初回のみ）
npm install -g @azure/static-web-apps-cli

# Static Web Apps にデプロイ
swa deploy ./dist \
  --app-name $STATIC_WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP
```

### 環境変数の設定
```bash
# Static Web Apps の設定
az staticwebapp appsettings set \
  --name $STATIC_WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --setting-names \
    "VUE_APP_API_URL=https://$WEB_APP_NAME.azurewebsites.net/api" \
    "VUE_APP_WEBSOCKET_URL=wss://$WEB_APP_NAME.azurewebsites.net/ws"
```

## 手順4: データベースの初期化

### SQL Database の初期化
```bash
# SQL Database に接続してテーブル作成
sqlcmd -S $SQL_SERVER_NAME.database.windows.net \
  -d $SQL_DATABASE_NAME \
  -U $SQL_ADMIN_USER \
  -P $SQL_ADMIN_PASSWORD \
  -i database/schema.sql

# サンプルデータの投入
sqlcmd -S $SQL_SERVER_NAME.database.windows.net \
  -d $SQL_DATABASE_NAME \
  -U $SQL_ADMIN_USER \
  -P $SQL_ADMIN_PASSWORD \
  -i database/sample_data.sql
```

### Cosmos DB の初期化
```bash
# Python スクリプトでCosmos DB の初期化
cd backend
python scripts/init_cosmos_db.py
```

## 手順5: 監視とアラートの設定

### Application Insights の設定
```bash
# Application Insights の接続
az webapp config appsettings set \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    "APPLICATIONINSIGHTS_CONNECTION_STRING=$APP_INSIGHTS_CONNECTION_STRING"

# Functions にも Application Insights を設定
az functionapp config appsettings set \
  --name $FUNCTION_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    "APPLICATIONINSIGHTS_CONNECTION_STRING=$APP_INSIGHTS_CONNECTION_STRING"
```

### アラートルールの作成
```bash
# API レスポンス時間のアラート
az monitor metrics alert create \
  --name "API-Response-Time-Alert" \
  --resource-group $RESOURCE_GROUP \
  --scopes "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Web/sites/$WEB_APP_NAME" \
  --condition "avg requests/duration > 1000" \
  --description "API response time is too high"

# 失敗率のアラート
az monitor metrics alert create \
  --name "API-Failure-Rate-Alert" \
  --resource-group $RESOURCE_GROUP \
  --scopes "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Web/sites/$WEB_APP_NAME" \
  --condition "avg requests/failed > 5" \
  --description "API failure rate is too high"
```

## 手順6: CI/CD パイプラインの設定

### GitHub Actions の設定

`.github/workflows/deploy.yml` を作成：

```yaml
name: Deploy Factory Equipment Manager

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.9'
    
    - name: Install dependencies
      run: |
        cd backend
        pip install -r requirements.txt
    
    - name: Deploy to Azure App Service
      uses: azure/webapps-deploy@v2
      with:
        app-name: ${{ secrets.AZURE_WEBAPP_NAME }}
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: ./backend/api

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    
    - name: Install dependencies
      run: |
        cd frontend
        npm install
    
    - name: Build
      run: |
        cd frontend
        npm run build
    
    - name: Deploy to Static Web Apps
      uses: Azure/static-web-apps-deploy@v1
      with:
        azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
        repo_token: ${{ secrets.GITHUB_TOKEN }}
        action: "upload"
        app_location: "/frontend"
        output_location: "dist"
```

## 手順7: 動作確認

### エンドポイントの確認
```bash
# API ヘルスチェック
curl https://$WEB_APP_NAME.azurewebsites.net/health

# フロントエンドアクセス
curl -I https://$STATIC_WEB_APP_NAME.azurestaticapps.net
```

### ログの確認
```bash
# Web App のログ
az webapp log tail --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP

# Functions のログ
az functionapp logs tail --name $FUNCTION_APP_NAME --resource-group $RESOURCE_GROUP
```

## トラブルシューティング

### よくある問題と対処法

1. **API が起動しない**
   ```bash
   # 起動コマンドの確認
   az webapp config show --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP --query "siteConfig.appCommandLine"
   
   # ログの確認
   az webapp log tail --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP
   ```

2. **データベース接続エラー**
   ```bash
   # 接続文字列の確認
   az webapp config appsettings list --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP --query "[?name=='SQL_CONNECTION_STRING']"
   
   # ファイアウォール規則の確認
   az sql server firewall-rule list --server $SQL_SERVER_NAME --resource-group $RESOURCE_GROUP
   ```

3. **フロントエンドが API にアクセスできない**
   ```bash
   # CORS 設定の確認
   # API側でCORS設定を確認
   
   # 環境変数の確認
   az staticwebapp appsettings list --name $STATIC_WEB_APP_NAME --resource-group $RESOURCE_GROUP
   ```

## セキュリティ設定

### API の認証設定
```bash
# Azure AD認証の設定
az webapp auth update \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --enabled true \
  --action LoginWithAzureActiveDirectory \
  --aad-client-id $AAD_CLIENT_ID \
  --aad-client-secret $AAD_CLIENT_SECRET
```

### ネットワークセキュリティ
```bash
# IP制限の設定
az webapp config access-restriction add \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --rule-name "AllowOfficeIP" \
  --action Allow \
  --ip-address "203.0.113.0/24" \
  --priority 100
```

## パフォーマンス最適化

### スケーリング設定
```bash
# App Service の自動スケーリング設定
az monitor autoscale create \
  --resource-group $RESOURCE_GROUP \
  --resource "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Web/sites/$WEB_APP_NAME" \
  --name "AutoScale-$WEB_APP_NAME" \
  --min-count 1 \
  --max-count 5 \
  --count 2
```

### CDN の設定
```bash
# Azure CDN プロファイルの作成
az cdn profile create \
  --name "cdn-factory-equipment" \
  --resource-group $RESOURCE_GROUP \
  --sku Standard_Microsoft

# CDN エンドポイントの作成
az cdn endpoint create \
  --name "cdn-factory-equipment-frontend" \
  --profile-name "cdn-factory-equipment" \
  --resource-group $RESOURCE_GROUP \
  --origin "$STATIC_WEB_APP_NAME.azurestaticapps.net"
```

## 運用・保守

### バックアップ設定
```bash
# SQL Database の自動バックアップ設定
az sql db ltr-policy set \
  --server $SQL_SERVER_NAME \
  --database $SQL_DATABASE_NAME \
  --resource-group $RESOURCE_GROUP \
  --weekly-retention P4W \
  --monthly-retention P12M \
  --yearly-retention P7Y
```

### 監視ダッシュボードの作成
```bash
# Azure Dashboard の作成（JSON設定ファイルを使用）
az portal dashboard create \
  --input-path dashboard-config.json \
  --resource-group $RESOURCE_GROUP \
  --name "Factory-Equipment-Dashboard"
```

## 次のステップ
1. [ユーザーガイド](./user-guide.md)
2. [運用・保守マニュアル](./maintenance-guide.md)
3. [パフォーマンス監視](./monitoring-guide.md)