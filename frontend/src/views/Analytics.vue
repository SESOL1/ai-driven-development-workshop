<template>
  <div class="analytics">
    <h2>データ分析</h2>
    
    <!-- 分析概要 -->
    <div class="analytics-overview">
      <div class="card overview-card">
        <h3>総稼働時間</h3>
        <div class="metric">{{ totalOperatingHours.toLocaleString() }}</div>
        <p class="metric-label">時間</p>
      </div>
      
      <div class="card overview-card">
        <h3>平均効率</h3>
        <div class="metric">{{ averageEfficiency }}%</div>
        <p class="metric-label">全設備</p>
      </div>
      
      <div class="card overview-card">
        <h3>ダウンタイム</h3>
        <div class="metric alert">{{ totalDowntime }}</div>
        <p class="metric-label">時間</p>
      </div>
      
      <div class="card overview-card">
        <h3>予測メンテナンス</h3>
        <div class="metric">{{ predictedMaintenance }}</div>
        <p class="metric-label">件</p>
      </div>
    </div>

    <!-- 期間選択 -->
    <div class="card period-selection">
      <h3>分析期間</h3>
      <div class="period-controls">
        <button 
          v-for="period in periods" 
          :key="period.value"
          @click="selectedPeriod = period.value"
          class="btn period-btn"
          :class="{ active: selectedPeriod === period.value }"
        >
          {{ period.label }}
        </button>
        <div class="custom-period">
          <input v-model="customStartDate" type="date" class="date-input">
          <span>～</span>
          <input v-model="customEndDate" type="date" class="date-input">
          <button @click="applyCustomPeriod" class="btn">適用</button>
        </div>
      </div>
    </div>

    <!-- グラフエリア -->
    <div class="charts-section">
      <!-- 稼働率推移 -->
      <div class="card chart-card">
        <h3>稼働率推移</h3>
        <div class="chart-placeholder">
          <div class="chart-info">
            <p>設備の稼働率を時系列で表示</p>
            <ul>
              <li>生産ライン A-1: 平均 94%</li>
              <li>生産ライン A-2: 平均 78% (警告)</li>
              <li>生産ライン B-1: 平均 91%</li>
              <li>包装ライン D-1: 平均 96%</li>
            </ul>
          </div>
          <div class="mock-chart">
            📊 稼働率チャート (Power BI連携)
          </div>
        </div>
      </div>

      <!-- 温度分析 -->
      <div class="card chart-card">
        <h3>温度分析</h3>
        <div class="chart-placeholder">
          <div class="chart-info">
            <p>設備温度の分布と異常検知</p>
            <ul>
              <li>正常範囲: 30-50°C</li>
              <li>警告レベル: 50-60°C</li>
              <li>危険レベル: 60°C以上</li>
            </ul>
          </div>
          <div class="mock-chart">
            🌡️ 温度分析チャート (Power BI連携)
          </div>
        </div>
      </div>
    </div>

    <!-- 予測分析 -->
    <div class="card prediction-section">
      <h3>AI予測分析</h3>
      <div class="prediction-grid">
        <div class="prediction-item">
          <h4>故障予測</h4>
          <div class="prediction-content">
            <div class="equipment-prediction">
              <span class="equipment-name">生産ライン A-2</span>
              <div class="prediction-bar">
                <div class="prediction-fill high-risk" style="width: 78%"></div>
              </div>
              <span class="prediction-value">78% (7日以内)</span>
            </div>
            <div class="equipment-prediction">
              <span class="equipment-name">検査装置 C-1</span>
              <div class="prediction-bar">
                <div class="prediction-fill medium-risk" style="width: 45%"></div>
              </div>
              <span class="prediction-value">45% (14日以内)</span>
            </div>
            <div class="equipment-prediction">
              <span class="equipment-name">生産ライン B-1</span>
              <div class="prediction-bar">
                <div class="prediction-fill low-risk" style="width: 12%"></div>
              </div>
              <span class="prediction-value">12% (30日以内)</span>
            </div>
          </div>
        </div>

        <div class="prediction-item">
          <h4>効率改善提案</h4>
          <div class="suggestions">
            <div class="suggestion-item">
              <div class="suggestion-icon">💡</div>
              <div class="suggestion-text">
                <strong>生産ライン A-2</strong><br>
                温度管理の最適化により効率を15%向上可能
              </div>
            </div>
            <div class="suggestion-item">
              <div class="suggestion-icon">🔧</div>
              <div class="suggestion-text">
                <strong>包装ライン D-1</strong><br>
                予防保全の間隔を調整してダウンタイムを20%削減
              </div>
            </div>
            <div class="suggestion-item">
              <div class="suggestion-icon">⚡</div>
              <div class="suggestion-text">
                <strong>全設備</strong><br>
                エネルギー使用量の最適化により運用コストを8%削減
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- データエクスポート -->
    <div class="card export-section">
      <h3>データエクスポート</h3>
      <div class="export-options">
        <button @click="exportData('excel')" class="btn">
          📊 Excelエクスポート
        </button>
        <button @click="exportData('csv')" class="btn">
          📋 CSVエクスポート
        </button>
        <button @click="exportData('pdf')" class="btn">
          📄 PDFレポート生成
        </button>
        <button @click="shareWithPowerBI" class="btn btn-success">
          📈 Power BIで開く
        </button>
      </div>
    </div>

    <!-- KPI一覧 -->
    <div class="card kpi-section">
      <h3>主要パフォーマンス指標 (KPI)</h3>
      <div class="kpi-grid">
        <div class="kpi-item">
          <div class="kpi-label">OEE (総合設備効率)</div>
          <div class="kpi-value">{{ oeeValue }}%</div>
          <div class="kpi-trend up">↗ +2.3%</div>
        </div>
        <div class="kpi-item">
          <div class="kpi-label">MTBF (平均故障間隔)</div>
          <div class="kpi-value">{{ mtbfValue }}h</div>
          <div class="kpi-trend up">↗ +15h</div>
        </div>
        <div class="kpi-item">
          <div class="kpi-label">MTTR (平均修理時間)</div>
          <div class="kpi-value">{{ mttrValue }}h</div>
          <div class="kpi-trend down">↘ -0.5h</div>
        </div>
        <div class="kpi-item">
          <div class="kpi-label">エネルギー効率</div>
          <div class="kpi-value">{{ energyEfficiency }}%</div>
          <div class="kpi-trend up">↗ +3.1%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Analytics',
  data() {
    return {
      totalOperatingHours: 156789,
      averageEfficiency: 89.7,
      totalDowntime: 42,
      predictedMaintenance: 5,
      selectedPeriod: '30days',
      customStartDate: '',
      customEndDate: '',
      oeeValue: 84.2,
      mtbfValue: 342,
      mttrValue: 2.8,
      energyEfficiency: 91.5,
      periods: [
        { label: '7日間', value: '7days' },
        { label: '30日間', value: '30days' },
        { label: '90日間', value: '90days' },
        { label: '1年間', value: '1year' }
      ]
    }
  },
  methods: {
    applyCustomPeriod() {
      if (this.customStartDate && this.customEndDate) {
        console.log(`期間設定: ${this.customStartDate} ~ ${this.customEndDate}`)
        // カスタム期間での分析データ更新
        this.selectedPeriod = 'custom'
      }
    },
    exportData(format) {
      console.log(`データを${format}形式でエクスポート中...`)
      // 実際のアプリケーションではAPIを呼び出してデータエクスポート
    },
    shareWithPowerBI() {
      console.log('Power BIでダッシュボードを開いています...')
      // Power BI統合処理
    }
  },
  mounted() {
    // 分析データの定期更新
    this.analysisInterval = setInterval(() => {
      // KPI値の更新シミュレーション
      this.averageEfficiency = (85 + Math.random() * 10).toFixed(1)
      this.oeeValue = (80 + Math.random() * 10).toFixed(1)
    }, 10000)
  },
  beforeUnmount() {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval)
    }
  }
}
</script>

<style scoped>
.analytics h2 {
  margin-bottom: 2rem;
  color: #2c3e50;
}

.analytics-overview {
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

.period-selection {
  margin-bottom: 2rem;
}

.period-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.period-btn {
  padding: 0.5rem 1rem;
  background-color: #ecf0f1;
  color: #2c3e50;
}

.period-btn.active {
  background-color: #3498db;
  color: white;
}

.custom-period {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-left: auto;
}

.date-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.chart-card {
  min-height: 300px;
}

.chart-placeholder {
  height: 250px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.chart-info ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.chart-info li {
  margin-bottom: 0.5rem;
}

.mock-chart {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: bold;
  height: 150px;
}

.prediction-section {
  margin-bottom: 2rem;
}

.prediction-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.prediction-item h4 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.equipment-prediction {
  display: grid;
  grid-template-columns: 1fr 2fr auto;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.equipment-name {
  font-weight: bold;
}

.prediction-bar {
  height: 20px;
  background-color: #ecf0f1;
  border-radius: 10px;
  overflow: hidden;
}

.prediction-fill {
  height: 100%;
  border-radius: 10px;
}

.prediction-fill.high-risk {
  background-color: #e74c3c;
}

.prediction-fill.medium-risk {
  background-color: #f39c12;
}

.prediction-fill.low-risk {
  background-color: #27ae60;
}

.prediction-value {
  font-size: 0.9rem;
  font-weight: bold;
}

.suggestions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.suggestion-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.suggestion-icon {
  font-size: 1.5rem;
}

.suggestion-text {
  flex: 1;
  font-size: 0.9rem;
  line-height: 1.4;
}

.export-section, .kpi-section {
  margin-bottom: 2rem;
}

.export-options {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.kpi-item {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.kpi-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
}

.kpi-value {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.kpi-trend {
  font-size: 0.9rem;
  font-weight: bold;
}

.kpi-trend.up {
  color: #27ae60;
}

.kpi-trend.down {
  color: #e74c3c;
}

@media (max-width: 768px) {
  .period-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .custom-period {
    margin-left: 0;
    margin-top: 1rem;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .prediction-grid {
    grid-template-columns: 1fr;
  }
}
</style>