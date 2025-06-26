<template>
  <div class="equipment">
    <h2>設備一覧</h2>
    
    <!-- 検索・フィルター -->
    <div class="card filter-section">
      <div class="filter-controls">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="設備名で検索..."
          class="search-input"
        >
        <select v-model="statusFilter" class="status-filter">
          <option value="">すべての状態</option>
          <option value="running">稼働中</option>
          <option value="warning">警告</option>
          <option value="stopped">停止中</option>
          <option value="maintenance">メンテナンス中</option>
        </select>
        <button @click="refreshData" class="btn btn-refresh">
          データ更新
        </button>
      </div>
    </div>

    <!-- 設備リスト -->
    <div class="equipment-grid">
      <div 
        v-for="equipment in filteredEquipment" 
        :key="equipment.id"
        class="card equipment-card"
        :class="equipment.status"
      >
        <div class="equipment-header">
          <h3>{{ equipment.name }}</h3>
          <div class="status-badge" :class="equipment.status">
            {{ getStatusLabel(equipment.status) }}
          </div>
        </div>
        
        <div class="equipment-info">
          <div class="info-row">
            <span class="label">設備ID:</span>
            <span class="value">{{ equipment.id }}</span>
          </div>
          <div class="info-row">
            <span class="label">設置場所:</span>
            <span class="value">{{ equipment.location }}</span>
          </div>
          <div class="info-row">
            <span class="label">稼働時間:</span>
            <span class="value">{{ equipment.operatingHours }}時間</span>
          </div>
          <div class="info-row">
            <span class="label">温度:</span>
            <span class="value">{{ equipment.temperature }}°C</span>
          </div>
          <div class="info-row">
            <span class="label">効率:</span>
            <span class="value">{{ equipment.efficiency }}%</span>
          </div>
          <div class="info-row">
            <span class="label">最終メンテナンス:</span>
            <span class="value">{{ formatDate(equipment.lastMaintenance) }}</span>
          </div>
        </div>
        
        <div class="equipment-actions">
          <button 
            @click="viewDetails(equipment.id)" 
            class="btn btn-small"
          >
            詳細表示
          </button>
          <button 
            @click="scheduleMaintenance(equipment.id)" 
            class="btn btn-small btn-warning"
          >
            メンテナンス予約
          </button>
          <button 
            v-if="equipment.status === 'running'" 
            @click="stopEquipment(equipment.id)"
            class="btn btn-small btn-danger"
          >
            停止
          </button>
          <button 
            v-if="equipment.status === 'stopped'" 
            @click="startEquipment(equipment.id)"
            class="btn btn-small btn-success"
          >
            開始
          </button>
        </div>
      </div>
    </div>

    <!-- 設備が見つからない場合 -->
    <div v-if="filteredEquipment.length === 0" class="card no-results">
      <p>検索条件に一致する設備が見つかりませんでした。</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Equipment',
  data() {
    return {
      searchQuery: '',
      statusFilter: '',
      equipmentList: [
        {
          id: 'EQ001',
          name: '生産ライン A-1',
          status: 'running',
          location: '工場棟A 1階',
          operatingHours: 2456,
          temperature: 45,
          efficiency: 94,
          lastMaintenance: new Date('2024-01-15')
        },
        {
          id: 'EQ002',
          name: '生産ライン A-2',
          status: 'warning',
          location: '工場棟A 1階',
          operatingHours: 3201,
          temperature: 62,
          efficiency: 78,
          lastMaintenance: new Date('2023-12-20')
        },
        {
          id: 'EQ003',
          name: '生産ライン B-1',
          status: 'running',
          location: '工場棟B 1階',
          operatingHours: 1899,
          temperature: 48,
          efficiency: 91,
          lastMaintenance: new Date('2024-02-01')
        },
        {
          id: 'EQ004',
          name: '生産ライン B-2',
          status: 'stopped',
          location: '工場棟B 1階',
          operatingHours: 0,
          temperature: 25,
          efficiency: 0,
          lastMaintenance: new Date('2024-03-01')
        },
        {
          id: 'EQ005',
          name: '検査装置 C-1',
          status: 'maintenance',
          location: '工場棟C 2階',
          operatingHours: 1234,
          temperature: 35,
          efficiency: 0,
          lastMaintenance: new Date('2024-03-10')
        },
        {
          id: 'EQ006',
          name: '包装ライン D-1',
          status: 'running',
          location: '工場棟D 1階',
          operatingHours: 2100,
          temperature: 40,
          efficiency: 96,
          lastMaintenance: new Date('2024-01-25')
        }
      ]
    }
  },
  computed: {
    filteredEquipment() {
      let filtered = this.equipmentList

      // 検索フィルター
      if (this.searchQuery) {
        filtered = filtered.filter(equipment =>
          equipment.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          equipment.id.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      }

      // ステータスフィルター
      if (this.statusFilter) {
        filtered = filtered.filter(equipment => equipment.status === this.statusFilter)
      }

      return filtered
    }
  },
  methods: {
    getStatusLabel(status) {
      const labels = {
        running: '稼働中',
        warning: '警告',
        stopped: '停止中',
        maintenance: 'メンテナンス中'
      }
      return labels[status] || status
    },
    formatDate(date) {
      return date.toLocaleDateString('ja-JP')
    },
    refreshData() {
      // データ更新のシミュレーション
      console.log('設備データを更新中...')
      // 実際のアプリケーションではAPIを呼び出してデータを更新
    },
    viewDetails(equipmentId) {
      console.log(`設備 ${equipmentId} の詳細を表示`)
      // 詳細画面への遷移やモーダル表示
    },
    scheduleMaintenance(equipmentId) {
      console.log(`設備 ${equipmentId} のメンテナンスを予約`)
      // メンテナンス予約機能
    },
    stopEquipment(equipmentId) {
      console.log(`設備 ${equipmentId} を停止`)
      // 設備停止処理
      const equipment = this.equipmentList.find(eq => eq.id === equipmentId)
      if (equipment) {
        equipment.status = 'stopped'
        equipment.temperature = 25
        equipment.efficiency = 0
      }
    },
    startEquipment(equipmentId) {
      console.log(`設備 ${equipmentId} を開始`)
      // 設備開始処理
      const equipment = this.equipmentList.find(eq => eq.id === equipmentId)
      if (equipment) {
        equipment.status = 'running'
        equipment.temperature = 40 + Math.random() * 20
        equipment.efficiency = 85 + Math.random() * 10
      }
    }
  }
}
</script>

<style scoped>
.equipment h2 {
  margin-bottom: 2rem;
  color: #2c3e50;
}

.filter-section {
  margin-bottom: 2rem;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.status-filter {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 150px;
}

.btn-refresh {
  white-space: nowrap;
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.equipment-card {
  border-left: 4px solid #27ae60;
}

.equipment-card.warning {
  border-left-color: #f39c12;
}

.equipment-card.stopped {
  border-left-color: #95a5a6;
}

.equipment-card.maintenance {
  border-left-color: #8e44ad;
}

.equipment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.equipment-header h3 {
  margin: 0;
  color: #2c3e50;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.status-badge.running {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.warning {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.stopped {
  background-color: #f8d7da;
  color: #721c24;
}

.status-badge.maintenance {
  background-color: #e2e3e5;
  color: #383d41;
}

.equipment-info {
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  border-bottom: 1px solid #ecf0f1;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: bold;
  color: #7f8c8d;
}

.value {
  color: #2c3e50;
}

.equipment-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}
</style>