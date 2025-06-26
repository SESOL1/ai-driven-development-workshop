<template>
  <div class="maintenance">
    <h2>メンテナンス管理</h2>
    
    <!-- メンテナンス概要 -->
    <div class="maintenance-overview">
      <div class="card overview-card">
        <h3>今日のメンテナンス</h3>
        <div class="metric">{{ todayMaintenance }}</div>
        <p class="metric-label">件</p>
      </div>
      
      <div class="card overview-card">
        <h3>今週の予定</h3>
        <div class="metric">{{ weeklyScheduled }}</div>
        <p class="metric-label">件</p>
      </div>
      
      <div class="card overview-card">
        <h3>遅延中</h3>
        <div class="metric alert">{{ overdueMaintenance }}</div>
        <p class="metric-label">件</p>
      </div>
      
      <div class="card overview-card">
        <h3>完了率</h3>
        <div class="metric">{{ completionRate }}%</div>
        <p class="metric-label">今月</p>
      </div>
    </div>

    <!-- アクションボタン -->
    <div class="card action-section">
      <button @click="showNewMaintenanceModal = true" class="btn btn-success">
        新規メンテナンス予約
      </button>
      <button @click="exportReport" class="btn">
        レポート出力
      </button>
      <button @click="refreshData" class="btn">
        データ更新
      </button>
    </div>

    <!-- メンテナンス一覧 -->
    <div class="card">
      <h3>メンテナンス一覧</h3>
      
      <!-- フィルター -->
      <div class="filter-controls">
        <select v-model="statusFilter" class="status-filter">
          <option value="">すべての状態</option>
          <option value="scheduled">予定</option>
          <option value="in-progress">実行中</option>
          <option value="completed">完了</option>
          <option value="overdue">遅延</option>
        </select>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="設備名で検索..."
          class="search-input"
        >
      </div>

      <!-- メンテナンス表 -->
      <div class="maintenance-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>設備名</th>
              <th>メンテナンス種別</th>
              <th>予定日</th>
              <th>担当者</th>
              <th>状態</th>
              <th>優先度</th>
              <th>アクション</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="maintenance in filteredMaintenance" 
              :key="maintenance.id"
              :class="maintenance.status"
            >
              <td>{{ maintenance.id }}</td>
              <td>{{ maintenance.equipmentName }}</td>
              <td>{{ maintenance.type }}</td>
              <td>{{ formatDate(maintenance.scheduledDate) }}</td>
              <td>{{ maintenance.assignee }}</td>
              <td>
                <span class="status-badge" :class="maintenance.status">
                  {{ getStatusLabel(maintenance.status) }}
                </span>
              </td>
              <td>
                <span class="priority-badge" :class="maintenance.priority">
                  {{ getPriorityLabel(maintenance.priority) }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button 
                    @click="viewDetails(maintenance.id)" 
                    class="btn btn-small"
                  >
                    詳細
                  </button>
                  <button 
                    v-if="maintenance.status === 'scheduled'"
                    @click="startMaintenance(maintenance.id)" 
                    class="btn btn-small btn-success"
                  >
                    開始
                  </button>
                  <button 
                    v-if="maintenance.status === 'in-progress'"
                    @click="completeMaintenance(maintenance.id)" 
                    class="btn btn-small btn-warning"
                  >
                    完了
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 新規メンテナンス予約モーダル -->
    <div v-if="showNewMaintenanceModal" class="modal-overlay">
      <div class="modal">
        <h3>新規メンテナンス予約</h3>
        <form @submit.prevent="createMaintenance">
          <div class="form-group">
            <label>設備選択:</label>
            <select v-model="newMaintenance.equipmentId" required>
              <option value="">設備を選択してください</option>
              <option value="EQ001">生産ライン A-1</option>
              <option value="EQ002">生産ライン A-2</option>
              <option value="EQ003">生産ライン B-1</option>
              <option value="EQ004">生産ライン B-2</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>メンテナンス種別:</label>
            <select v-model="newMaintenance.type" required>
              <option value="">種別を選択してください</option>
              <option value="定期点検">定期点検</option>
              <option value="予防保全">予防保全</option>
              <option value="修理">修理</option>
              <option value="部品交換">部品交換</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>予定日:</label>
            <input v-model="newMaintenance.scheduledDate" type="date" required>
          </div>
          
          <div class="form-group">
            <label>担当者:</label>
            <input v-model="newMaintenance.assignee" type="text" required>
          </div>
          
          <div class="form-group">
            <label>優先度:</label>
            <select v-model="newMaintenance.priority" required>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
          
          <div class="modal-actions">
            <button type="submit" class="btn btn-success">登録</button>
            <button type="button" @click="showNewMaintenanceModal = false" class="btn">
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Maintenance',
  data() {
    return {
      todayMaintenance: 2,
      weeklyScheduled: 5,
      overdueMaintenance: 1,
      completionRate: 89,
      statusFilter: '',
      searchQuery: '',
      showNewMaintenanceModal: false,
      newMaintenance: {
        equipmentId: '',
        type: '',
        scheduledDate: '',
        assignee: '',
        priority: 'medium'
      },
      maintenanceList: [
        {
          id: 'MT001',
          equipmentName: '生産ライン A-1',
          type: '定期点検',
          scheduledDate: new Date('2024-03-15'),
          assignee: '田中太郎',
          status: 'scheduled',
          priority: 'medium'
        },
        {
          id: 'MT002',
          equipmentName: '生産ライン A-2',
          type: '修理',
          scheduledDate: new Date('2024-03-12'),
          assignee: '佐藤花子',
          status: 'in-progress',
          priority: 'high'
        },
        {
          id: 'MT003',
          equipmentName: '生産ライン B-1',
          type: '予防保全',
          scheduledDate: new Date('2024-03-18'),
          assignee: '山田次郎',
          status: 'scheduled',
          priority: 'low'
        },
        {
          id: 'MT004',
          equipmentName: '検査装置 C-1',
          type: '部品交換',
          scheduledDate: new Date('2024-03-10'),
          assignee: '鈴木一郎',
          status: 'overdue',
          priority: 'high'
        },
        {
          id: 'MT005',
          equipmentName: '包装ライン D-1',
          type: '定期点検',
          scheduledDate: new Date('2024-03-05'),
          assignee: '高橋美香',
          status: 'completed',
          priority: 'medium'
        }
      ]
    }
  },
  computed: {
    filteredMaintenance() {
      let filtered = this.maintenanceList

      if (this.statusFilter) {
        filtered = filtered.filter(maintenance => maintenance.status === this.statusFilter)
      }

      if (this.searchQuery) {
        filtered = filtered.filter(maintenance =>
          maintenance.equipmentName.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      }

      return filtered
    }
  },
  methods: {
    getStatusLabel(status) {
      const labels = {
        scheduled: '予定',
        'in-progress': '実行中',
        completed: '完了',
        overdue: '遅延'
      }
      return labels[status] || status
    },
    getPriorityLabel(priority) {
      const labels = {
        high: '高',
        medium: '中',
        low: '低'
      }
      return labels[priority] || priority
    },
    formatDate(date) {
      return date.toLocaleDateString('ja-JP')
    },
    refreshData() {
      console.log('メンテナンスデータを更新中...')
    },
    exportReport() {
      console.log('レポートを出力中...')
    },
    viewDetails(maintenanceId) {
      console.log(`メンテナンス ${maintenanceId} の詳細を表示`)
    },
    startMaintenance(maintenanceId) {
      const maintenance = this.maintenanceList.find(m => m.id === maintenanceId)
      if (maintenance) {
        maintenance.status = 'in-progress'
        console.log(`メンテナンス ${maintenanceId} を開始しました`)
      }
    },
    completeMaintenance(maintenanceId) {
      const maintenance = this.maintenanceList.find(m => m.id === maintenanceId)
      if (maintenance) {
        maintenance.status = 'completed'
        console.log(`メンテナンス ${maintenanceId} を完了しました`)
      }
    },
    createMaintenance() {
      const newId = 'MT' + String(this.maintenanceList.length + 1).padStart(3, '0')
      const equipmentNames = {
        'EQ001': '生産ライン A-1',
        'EQ002': '生産ライン A-2',
        'EQ003': '生産ライン B-1',
        'EQ004': '生産ライン B-2'
      }
      
      this.maintenanceList.push({
        id: newId,
        equipmentName: equipmentNames[this.newMaintenance.equipmentId],
        type: this.newMaintenance.type,
        scheduledDate: new Date(this.newMaintenance.scheduledDate),
        assignee: this.newMaintenance.assignee,
        status: 'scheduled',
        priority: this.newMaintenance.priority
      })
      
      // フォームリセット
      this.newMaintenance = {
        equipmentId: '',
        type: '',
        scheduledDate: '',
        assignee: '',
        priority: 'medium'
      }
      
      this.showNewMaintenanceModal = false
      console.log('新しいメンテナンスが登録されました')
    }
  }
}
</script>

<style scoped>
.maintenance h2 {
  margin-bottom: 2rem;
  color: #2c3e50;
}

.maintenance-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
  font-size: 2rem;
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

.action-section {
  margin-bottom: 2rem;
}

.action-section .btn {
  margin-right: 1rem;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-input, .status-filter {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.maintenance-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #2c3e50;
}

tr:hover {
  background-color: #f8f9fa;
}

tr.overdue {
  background-color: #fdf2f2;
}

tr.in-progress {
  background-color: #fff3cd;
}

tr.completed {
  background-color: #d4edda;
}

.status-badge, .priority-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.status-badge.scheduled {
  background-color: #e2e3e5;
  color: #383d41;
}

.status-badge.in-progress {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.completed {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.overdue {
  background-color: #f8d7da;
  color: #721c24;
}

.priority-badge.high {
  background-color: #f8d7da;
  color: #721c24;
}

.priority-badge.medium {
  background-color: #fff3cd;
  color: #856404;
}

.priority-badge.low {
  background-color: #d1ecf1;
  color: #0c5460;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-small {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

/* モーダルスタイル */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal h3 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #34495e;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}
</style>