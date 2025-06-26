import axios from 'axios'

// API設定
const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:8000/api'

// Axiosインスタンスの作成
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// リクエストインターセプター
apiClient.interceptors.request.use(
  (config) => {
    // 認証トークンがある場合は追加
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// レスポンスインターセプター
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message)
    
    // 401エラーの場合は認証情報をクリア
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      // ログインページにリダイレクト
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

// 設備関連API
export const equipmentAPI = {
  // 設備一覧取得
  async getAll() {
    const response = await apiClient.get('/equipment')
    return response.data
  },

  // 設備詳細取得
  async getById(id) {
    const response = await apiClient.get(`/equipment/${id}`)
    return response.data
  },

  // 設備状態更新
  async updateStatus(id, status) {
    const response = await apiClient.patch(`/equipment/${id}/status`, { status })
    return response.data
  },

  // 設備リアルタイムデータ取得
  async getRealTimeData(id) {
    const response = await apiClient.get(`/equipment/${id}/realtime`)
    return response.data
  }
}

// メンテナンス関連API
export const maintenanceAPI = {
  // メンテナンス一覧取得
  async getAll(params = {}) {
    const response = await apiClient.get('/maintenance', { params })
    return response.data
  },

  // メンテナンス詳細取得
  async getById(id) {
    const response = await apiClient.get(`/maintenance/${id}`)
    return response.data
  },

  // 新規メンテナンス登録
  async create(maintenanceData) {
    const response = await apiClient.post('/maintenance', maintenanceData)
    return response.data
  },

  // メンテナンス更新
  async update(id, maintenanceData) {
    const response = await apiClient.put(`/maintenance/${id}`, maintenanceData)
    return response.data
  },

  // メンテナンス状態変更
  async updateStatus(id, status) {
    const response = await apiClient.patch(`/maintenance/${id}/status`, { status })
    return response.data
  },

  // メンテナンスレポート出力
  async exportReport(params = {}) {
    const response = await apiClient.get('/maintenance/export', { 
      params,
      responseType: 'blob'
    })
    return response.data
  }
}

// 分析関連API
export const analyticsAPI = {
  // ダッシュボードデータ取得
  async getDashboardData(period = '30days') {
    const response = await apiClient.get('/analytics/dashboard', {
      params: { period }
    })
    return response.data
  },

  // 稼働率データ取得
  async getOperationRateData(equipmentId, period) {
    const response = await apiClient.get('/analytics/operation-rate', {
      params: { equipment_id: equipmentId, period }
    })
    return response.data
  },

  // 温度分析データ取得
  async getTemperatureAnalysis(equipmentId, period) {
    const response = await apiClient.get('/analytics/temperature', {
      params: { equipment_id: equipmentId, period }
    })
    return response.data
  },

  // 故障予測データ取得
  async getFailurePrediction() {
    const response = await apiClient.get('/analytics/failure-prediction')
    return response.data
  },

  // KPIデータ取得
  async getKPIData(period = '30days') {
    const response = await apiClient.get('/analytics/kpi', {
      params: { period }
    })
    return response.data
  },

  // データエクスポート
  async exportData(format, params = {}) {
    const response = await apiClient.get(`/analytics/export/${format}`, {
      params,
      responseType: 'blob'
    })
    return response.data
  }
}

// 通知関連API
export const notificationAPI = {
  // 通知一覧取得
  async getAll(params = {}) {
    const response = await apiClient.get('/notifications', { params })
    return response.data
  },

  // 通知既読化
  async markAsRead(id) {
    const response = await apiClient.patch(`/notifications/${id}/read`)
    return response.data
  },

  // 通知設定取得
  async getSettings() {
    const response = await apiClient.get('/notifications/settings')
    return response.data
  },

  // 通知設定更新
  async updateSettings(settings) {
    const response = await apiClient.put('/notifications/settings', settings)
    return response.data
  }
}

// ユーザー認証API
export const authAPI = {
  // ログイン
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials)
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token)
    }
    return response.data
  },

  // ログアウト
  async logout() {
    await apiClient.post('/auth/logout')
    localStorage.removeItem('authToken')
  },

  // ユーザー情報取得
  async getCurrentUser() {
    const response = await apiClient.get('/auth/user')
    return response.data
  }
}

// WebSocket接続管理
export class WebSocketService {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 5000
  }

  connect(url = 'ws://localhost:8000/ws') {
    try {
      this.ws = new WebSocket(url)
      
      this.ws.onopen = () => {
        console.log('WebSocket接続が確立されました')
        this.reconnectAttempts = 0
      }
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (error) {
          console.error('WebSocketメッセージの解析に失敗:', error)
        }
      }
      
      this.ws.onclose = () => {
        console.log('WebSocket接続が閉じられました')
        this.attemptReconnect()
      }
      
      this.ws.onerror = (error) => {
        console.error('WebSocketエラー:', error)
      }
    } catch (error) {
      console.error('WebSocket接続の初期化に失敗:', error)
    }
  }

  handleMessage(data) {
    // メッセージタイプに応じた処理
    switch (data.type) {
      case 'equipment_status':
        // 設備状態の更新をVueコンポーネントに通知
        window.dispatchEvent(new CustomEvent('equipmentStatusUpdate', { detail: data }))
        break
      case 'maintenance_alert':
        // メンテナンスアラートの通知
        window.dispatchEvent(new CustomEvent('maintenanceAlert', { detail: data }))
        break
      case 'analytics_update':
        // 分析データの更新通知
        window.dispatchEvent(new CustomEvent('analyticsUpdate', { detail: data }))
        break
      default:
        console.log('未知のメッセージタイプ:', data.type)
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`WebSocket再接続試行 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
      
      setTimeout(() => {
        this.connect()
      }, this.reconnectInterval)
    } else {
      console.error('WebSocket再接続の最大試行回数に達しました')
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.error('WebSocket接続が利用できません')
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// WebSocketサービスのシングルトンインスタンス
export const webSocketService = new WebSocketService()

// エラーハンドリングユーティリティ
export const handleAPIError = (error) => {
  if (error.response) {
    // サーバーからのエラーレスポンス
    const status = error.response.status
    const message = error.response.data?.message || 'APIエラーが発生しました'
    
    switch (status) {
      case 400:
        return `リクエストが無効です: ${message}`
      case 401:
        return '認証が必要です。ログインしてください。'
      case 403:
        return 'アクセス権限がありません。'
      case 404:
        return 'リソースが見つかりません。'
      case 500:
        return 'サーバーエラーが発生しました。しばらく待ってから再試行してください。'
      default:
        return `エラーが発生しました (${status}): ${message}`
    }
  } else if (error.request) {
    // ネットワークエラー
    return 'ネットワークエラーが発生しました。インターネット接続を確認してください。'
  } else {
    // その他のエラー
    return '予期しないエラーが発生しました。'
  }
}

export default {
  equipmentAPI,
  maintenanceAPI,
  analyticsAPI,
  notificationAPI,
  authAPI,
  webSocketService,
  handleAPIError
}