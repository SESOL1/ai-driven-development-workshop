# Azure環境セットアップ手順

## 概要
工場設備管理アプリで使用するAzureリソースの作成手順を説明します。Azure初心者でも実行できるよう、詳細な手順を記載しています。

## 前提条件
1. Azureアカウントを持っていること
2. Azure CLIがインストールされていること
3. 適切な権限（Contributor以上）を持っていること

## Azure CLIのインストール
まだAzure CLIがインストールされていない場合は、以下の手順でインストールしてください。

### Windows
```bash
# PowerShellで実行
Invoke-WebRequest -Uri https://aka.ms/installazurecliwindows -OutFile .\AzureCLI.msi; Start-Process msiexec.exe -Wait -ArgumentList '/I AzureCLI.msi /quiet'; rm .\AzureCLI.msi
```

### macOS
```bash
brew install azure-cli
```

### Linux (Ubuntu/Debian)
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

## 手順1: Azureにログイン

```bash
# Azureにログイン
az login

# サブスクリプションの確認
az account show

# 使用するサブスクリプションを設定（複数ある場合）
az account set --subscription "your-subscription-id"
```

## 手順2: リソースグループの作成

```bash
# 変数の設定
RESOURCE_GROUP="rg-factory-equipment-manager"
LOCATION="japaneast"

# リソースグループの作成
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

# 作成確認
az group show --name $RESOURCE_GROUP
```

## 手順3: Azure SQL Databaseの作成

```bash
# SQL Server の作成
SQL_SERVER_NAME="sql-factory-equipment-$(date +%s)"
SQL_ADMIN_USER="sqladmin"
SQL_ADMIN_PASSWORD="P@ssw0rd123!"

az sql server create \
  --name $SQL_SERVER_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --admin-user $SQL_ADMIN_USER \
  --admin-password $SQL_ADMIN_PASSWORD

# ファイアウォール規則の設定（Azure Services のアクセスを許可）
az sql server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --server $SQL_SERVER_NAME \
  --name "AllowAzureServices" \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# SQL Database の作成
SQL_DATABASE_NAME="sqldb-factory-equipment"
az sql db create \
  --resource-group $RESOURCE_GROUP \
  --server $SQL_SERVER_NAME \
  --name $SQL_DATABASE_NAME \
  --service-objective Basic

# 接続文字列の取得
az sql db show-connection-string \
  --server $SQL_SERVER_NAME \
  --name $SQL_DATABASE_NAME \
  --client ado.net
```

## 手順4: Azure Cosmos DBの作成

```bash
# Cosmos DB アカウントの作成
COSMOS_ACCOUNT_NAME="cosmos-factory-equipment-$(date +%s)"
az cosmosdb create \
  --name $COSMOS_ACCOUNT_NAME \
  --resource-group $RESOURCE_GROUP \
  --default-consistency-level Session \
  --locations regionName=$LOCATION failoverPriority=0 isZoneRedundant=False

# データベースの作成
COSMOS_DATABASE_NAME="factory-equipment-db"
az cosmosdb sql database create \
  --account-name $COSMOS_ACCOUNT_NAME \
  --resource-group $RESOURCE_GROUP \
  --name $COSMOS_DATABASE_NAME

# コンテナーの作成（IoTデータ用）
az cosmosdb sql container create \
  --account-name $COSMOS_ACCOUNT_NAME \
  --database-name $COSMOS_DATABASE_NAME \
  --resource-group $RESOURCE_GROUP \
  --name "iot-data" \
  --partition-key-path "/deviceId" \
  --throughput 400

# 接続文字列の取得
az cosmosdb keys list \
  --name $COSMOS_ACCOUNT_NAME \
  --resource-group $RESOURCE_GROUP \
  --type connection-strings
```

## 手順5: Azure Functions の作成

```bash
# ストレージアカウントの作成（Functions用）
STORAGE_ACCOUNT_NAME="stfactoryequip$(date +%s | cut -c 6-10)"
az storage account create \
  --name $STORAGE_ACCOUNT_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS

# Function App の作成
FUNCTION_APP_NAME="func-factory-equipment-$(date +%s)"
az functionapp create \
  --resource-group $RESOURCE_GROUP \
  --consumption-plan-location $LOCATION \
  --runtime python \
  --runtime-version 3.9 \
  --functions-version 4 \
  --name $FUNCTION_APP_NAME \
  --storage-account $STORAGE_ACCOUNT_NAME

# アプリケーション設定の追加
az functionapp config appsettings set \
  --name $FUNCTION_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings "SQL_CONNECTION_STRING=Server=tcp:$SQL_SERVER_NAME.database.windows.net,1433;Initial Catalog=$SQL_DATABASE_NAME;Persist Security Info=False;User ID=$SQL_ADMIN_USER;Password=$SQL_ADMIN_PASSWORD;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
```

## 手順6: Azure App Service の作成（Web API用）

```bash
# App Service Plan の作成
APP_SERVICE_PLAN_NAME="asp-factory-equipment"
az appservice plan create \
  --name $APP_SERVICE_PLAN_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku B1 \
  --is-linux

# Web App の作成
WEB_APP_NAME="app-factory-equipment-$(date +%s)"
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN_NAME \
  --name $WEB_APP_NAME \
  --runtime "PYTHON|3.9"

# アプリケーション設定の追加
az webapp config appsettings set \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings "SQL_CONNECTION_STRING=Server=tcp:$SQL_SERVER_NAME.database.windows.net,1433;Initial Catalog=$SQL_DATABASE_NAME;Persist Security Info=False;User ID=$SQL_ADMIN_USER;Password=$SQL_ADMIN_PASSWORD;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
```

## 手順7: Azure Static Web Apps の作成（フロントエンド用）

```bash
# Static Web App の作成
STATIC_WEB_APP_NAME="swa-factory-equipment"
az staticwebapp create \
  --name $STATIC_WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION
```

## 手順8: Azure IoT Hub の作成（オプション）

```bash
# IoT Hub の作成
IOT_HUB_NAME="iothub-factory-equipment-$(date +%s)"
az iot hub create \
  --name $IOT_HUB_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku S1

# IoT デバイスの作成例
az iot hub device-identity create \
  --hub-name $IOT_HUB_NAME \
  --device-id "equipment-sensor-001"
```

## 手順9: Azure Monitor の設定

```bash
# Log Analytics ワークスペースの作成
LOG_ANALYTICS_WORKSPACE="log-factory-equipment"
az monitor log-analytics workspace create \
  --resource-group $RESOURCE_GROUP \
  --workspace-name $LOG_ANALYTICS_WORKSPACE \
  --location $LOCATION

# Application Insights の作成
APP_INSIGHTS_NAME="appi-factory-equipment"
az monitor app-insights component create \
  --app $APP_INSIGHTS_NAME \
  --location $LOCATION \
  --resource-group $RESOURCE_GROUP \
  --workspace $LOG_ANALYTICS_WORKSPACE
```

## 手順10: リソースの確認

```bash
# 作成されたリソースの一覧表示
az resource list --resource-group $RESOURCE_GROUP --output table

# リソースグループの詳細表示
az group show --name $RESOURCE_GROUP
```

## 接続情報の取得

### SQL Database 接続文字列
```bash
echo "SQL Server: $SQL_SERVER_NAME.database.windows.net"
echo "Database: $SQL_DATABASE_NAME"
echo "Username: $SQL_ADMIN_USER"
echo "Password: $SQL_ADMIN_PASSWORD"
```

### Cosmos DB 接続情報
```bash
az cosmosdb keys list --name $COSMOS_ACCOUNT_NAME --resource-group $RESOURCE_GROUP
```

### Function App URL
```bash
echo "Function App URL: https://$FUNCTION_APP_NAME.azurewebsites.net"
```

### Web App URL
```bash
echo "Web App URL: https://$WEB_APP_NAME.azurewebsites.net"
```

## 重要な注意事項

1. **パスワード管理**: SQL Serverのパスワードは安全に管理してください
2. **ファイアウォール設定**: 必要に応じてSQL Serverのファイアウォール規則を調整してください
3. **コスト管理**: 不要なリソースは削除してコストを削減してください
4. **セキュリティ**: 本番環境では適切なセキュリティ設定を行ってください

## トラブルシューティング

### よくあるエラーと対処法

1. **リソース名の重複エラー**
   - リソース名にタイムスタンプを追加して一意性を確保しています
   - エラーが発生した場合は、別の名前を試してください

2. **権限エラー**
   - サブスクリプションに対する適切な権限があることを確認してください
   - `az role assignment list --assignee <your-email>` で権限を確認できます

3. **クォータ制限エラー**
   - リージョンでのリソース制限に達している可能性があります
   - 別のリージョンを試すか、サポートに連絡してください

## 次のステップ

1. [バックエンドのデプロイ](../backend/README.md)
2. [フロントエンドのデプロイ](../frontend/README.md)
3. [アプリケーションの設定](./deployment.md)