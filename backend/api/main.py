from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
import uvicorn
import os
from datetime import datetime, timedelta

from .database import get_db, engine
from .models import equipment, maintenance, analytics
from .schemas import equipment_schemas, maintenance_schemas, analytics_schemas
from .services import equipment_service, maintenance_service, analytics_service

# FastAPI アプリケーションの初期化
app = FastAPI(
    title="工場設備管理API",
    description="工場設備の監視・管理・分析を行うAPI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では特定のドメインに制限
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# セキュリティ設定
security = HTTPBearer()

# データベーステーブルの作成
equipment.Base.metadata.create_all(bind=engine)
maintenance.Base.metadata.create_all(bind=engine)
analytics.Base.metadata.create_all(bind=engine)


# 認証依存関数
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    JWTトークンからユーザー情報を取得
    本実装では簡略化しています
    """
    # 実際の実装ではJWTトークンの検証を行う
    return {"user_id": "demo_user", "username": "demo"}


# ヘルスチェックエンドポイント
@app.get("/health")
async def health_check():
    """
    アプリケーションの正常性チェック
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }


# 設備関連エンドポイント
@app.get("/api/equipment", response_model=List[equipment_schemas.EquipmentResponse])
async def get_equipment_list(
    status: Optional[str] = None,
    location: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    設備一覧を取得
    """
    return equipment_service.get_equipment_list(db, status=status, location=location)


@app.get("/api/equipment/{equipment_id}", response_model=equipment_schemas.EquipmentResponse)
async def get_equipment_detail(
    equipment_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    設備詳細を取得
    """
    equipment_data = equipment_service.get_equipment_by_id(db, equipment_id)
    if not equipment_data:
        raise HTTPException(status_code=404, detail="設備が見つかりません")
    return equipment_data


@app.patch("/api/equipment/{equipment_id}/status")
async def update_equipment_status(
    equipment_id: str,
    status_update: equipment_schemas.EquipmentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    設備の状態を更新
    """
    updated_equipment = equipment_service.update_equipment_status(
        db, equipment_id, status_update.status
    )
    if not updated_equipment:
        raise HTTPException(status_code=404, detail="設備が見つかりません")
    return {"message": "設備状態が更新されました", "equipment": updated_equipment}


@app.get("/api/equipment/{equipment_id}/realtime")
async def get_equipment_realtime_data(
    equipment_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    設備のリアルタイムデータを取得
    """
    realtime_data = equipment_service.get_realtime_data(db, equipment_id)
    if not realtime_data:
        raise HTTPException(status_code=404, detail="設備が見つかりません")
    return realtime_data


# メンテナンス関連エンドポイント
@app.get("/api/maintenance", response_model=List[maintenance_schemas.MaintenanceResponse])
async def get_maintenance_list(
    status: Optional[str] = None,
    equipment_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    メンテナンス一覧を取得
    """
    return maintenance_service.get_maintenance_list(db, status=status, equipment_id=equipment_id)


@app.post("/api/maintenance", response_model=maintenance_schemas.MaintenanceResponse)
async def create_maintenance(
    maintenance_data: maintenance_schemas.MaintenanceCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    新しいメンテナンスを登録
    """
    return maintenance_service.create_maintenance(db, maintenance_data, current_user["user_id"])


@app.get("/api/maintenance/{maintenance_id}", response_model=maintenance_schemas.MaintenanceResponse)
async def get_maintenance_detail(
    maintenance_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    メンテナンス詳細を取得
    """
    maintenance_data = maintenance_service.get_maintenance_by_id(db, maintenance_id)
    if not maintenance_data:
        raise HTTPException(status_code=404, detail="メンテナンス情報が見つかりません")
    return maintenance_data


@app.patch("/api/maintenance/{maintenance_id}/status")
async def update_maintenance_status(
    maintenance_id: str,
    status_update: maintenance_schemas.MaintenanceStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    メンテナンス状態を更新
    """
    updated_maintenance = maintenance_service.update_maintenance_status(
        db, maintenance_id, status_update.status
    )
    if not updated_maintenance:
        raise HTTPException(status_code=404, detail="メンテナンス情報が見つかりません")
    return {"message": "メンテナンス状態が更新されました", "maintenance": updated_maintenance}


# 分析関連エンドポイント
@app.get("/api/analytics/dashboard")
async def get_dashboard_data(
    period: str = "30days",
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    ダッシュボード用の分析データを取得
    """
    return analytics_service.get_dashboard_data(db, period)


@app.get("/api/analytics/operation-rate")
async def get_operation_rate_data(
    equipment_id: Optional[str] = None,
    period: str = "30days",
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    稼働率データを取得
    """
    return analytics_service.get_operation_rate_data(db, equipment_id, period)


@app.get("/api/analytics/failure-prediction")
async def get_failure_prediction(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    故障予測データを取得
    """
    return analytics_service.get_failure_prediction(db)


@app.get("/api/analytics/kpi")
async def get_kpi_data(
    period: str = "30days",
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    KPIデータを取得
    """
    return analytics_service.get_kpi_data(db, period)


# WebSocket エンドポイント
@app.websocket("/ws")
async def websocket_endpoint(websocket):
    """
    リアルタイムデータ配信用WebSocket
    """
    await websocket.accept()
    try:
        while True:
            # リアルタイムデータの配信
            # 実際の実装では設備からのデータを受信して配信
            await websocket.send_json({
                "type": "equipment_status",
                "data": {
                    "equipment_id": "EQ001",
                    "status": "running",
                    "temperature": 45.2,
                    "timestamp": datetime.utcnow().isoformat()
                }
            })
            await asyncio.sleep(5)  # 5秒間隔でデータ送信
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()


if __name__ == "__main__":
    # 開発サーバーの起動
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )