<template>
  <div class="dashboard">
    <h2>ダッシュボード</h2>
    
    <!-- 概要カード -->
    <div class="overview-cards">
      <div class="card overview-card">
        <h3>稼働中の設備</h3>
        <div class="metric">{{ activeEquipment }}</div>
        <p class="metric-label">台</p>
      </div>
      
      <div class="card overview-card">
        <h3>今日のアラート</h3>
        <div class="metric alert">{{ todayAlerts }}</div>
        <p class="metric-label">件</p>
      </div>
      
      <div class="card overview-card">
        <h3>稼働率</h3>
        <div class="metric">{{ operationRate }}%</div>
        <p class="metric-label">平均</p>
      </div>
      
      <div class="card overview-card">
        <h3>予定メンテナンス</h3>
        <div class="metric">{{ scheduledMaintenance }}</div>
        <p class="metric-label">件</p>
      </div>
    </div>

    <!-- リアルタイム監視 -->
    <div class="card">
      <h3>リアルタイム設備監視</h3>
      <div class="equipment-status">
        <div 
          v-for="equipment in equipmentList" 
          :key="equipment.id"
          class="equipment-item"
          :class="equipment.status"
        >
          <div class="equipment-name">{{ equipment.name }}</div>
          <div class="equipment-status-indicator"></div>
          <div class="equipment-details">
            <span>温度: {{ equipment.temperature }}°C</span>
            <span>稼働時間: {{ equipment.operatingHours }}h</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近のアクティビティ -->
    <div class="card">
      <h3>最近のアクティビティ</h3>
      <div class="activity-list">
        <div 
          v-for="activity in recentActivities" 
          :key="activity.id"
          class="activity-item"
        >
          <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
          <div class="activity-description">{{ activity.description }}</div>
          <div class="activity-type" :class="activity.type">{{ activity.typeLabel }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      activeEquipment: 12,
      todayAlerts: 3,
      operationRate: 94.5,
      scheduledMaintenance: 2,
      equipmentList: [
        {
          id: 1,
          name: '生産ライン A-1',
          status: 'running',
          temperature: 45,
          operatingHours: 156
        },
        {
          id: 2,
          name: '生産ライン A-2',
          status: 'warning',
          temperature: 62,
          operatingHours: 234
        },
        {
          id: 3,
          name: '生産ライン B-1',
          status: 'running',
          temperature: 48,
          operatingHours: 189
        },
        {
          id: 4,
          name: '生産ライン B-2',
          status: 'stopped',
          temperature: 25,
          operatingHours: 0
        }
      ],
      recentActivities: [
        {
          id: 1,
          timestamp: new Date(Date.now() - 300000),
          description: '生産ライン A-2 で温度異常を検出',
          type: 'warning',
          typeLabel: '警告'
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 900000),
          description: '生産ライン B-2 のメンテナンスが完了',
          type: 'success',
          typeLabel: '完了'
        },
        {
          id: 3,
          timestamp: new Date(Date.now() - 1800000),
          description: '新しい設備監視データが更新されました',
          type: 'info',
          typeLabel: '情報'
        }
      ]
    }
  },
  methods: {
    formatTime(timestamp) {
      return timestamp.toLocaleTimeString('ja-JP')
    }
  },
  mounted() {
    // 定期的にデータを更新するシミュレーション
    this.updateInterval = setInterval(() => {
      // リアルタイムデータの更新をシミュレート
      this.operationRate = (90 + Math.random() * 10).toFixed(1)
    }, 5000)
  },
  beforeUnmount() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }
  }
}
</script>

<style scoped>
.dashboard h2 {
  margin-bottom: 2rem;
  color: #2c3e50;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.overview-card {
  text-align: center;
}

.overview-card h3 {
  margin-bottom: 1rem;
  color: #34495e;
  font-size: 1rem;
}

.metric {
  font-size: 2.5rem;
  font-weight: bold;
  color: #27ae60;
  margin-bottom: 0.5rem;
}

.metric.alert {
  color: #e74c3c;
}

.metric-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.equipment-status {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.equipment-item {
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #27ae60;
  background: #f8f9fa;
}

.equipment-item.warning {
  border-left-color: #f39c12;
}

.equipment-item.stopped {
  border-left-color: #e74c3c;
}

.equipment-name {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.equipment-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.activity-list {
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #ecf0f1;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-time {
  font-size: 0.85rem;
  color: #7f8c8d;
  min-width: 80px;
}

.activity-description {
  flex: 1;
  margin: 0 1rem;
}

.activity-type {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.activity-type.warning {
  background-color: #fff3cd;
  color: #856404;
}

.activity-type.success {
  background-color: #d4edda;
  color: #155724;
}

.activity-type.info {
  background-color: #d1ecf1;
  color: #0c5460;
}
</style>