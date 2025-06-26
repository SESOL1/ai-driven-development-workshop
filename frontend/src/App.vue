<template>
  <div id="app">
    <!-- ナビゲーションヘッダー -->
    <nav class="navbar">
      <div class="nav-brand">
        <h1>工場設備管理システム</h1>
      </div>
      <div class="nav-menu">
        <router-link to="/" class="nav-link">ダッシュボード</router-link>
        <router-link to="/equipment" class="nav-link">設備一覧</router-link>
        <router-link to="/maintenance" class="nav-link">メンテナンス</router-link>
        <router-link to="/analytics" class="nav-link">分析</router-link>
      </div>
    </nav>

    <!-- メインコンテンツエリア -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- フッター -->
    <footer class="footer">
      <p>&copy; 2024 工場設備管理システム - AI-Driven Development Workshop</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    console.log('工場設備管理アプリが起動しました')
  }
}
</script>

<style>
/* グローバルスタイル */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ナビゲーションスタイル */
.navbar {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav-brand h1 {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-menu {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  background-color: #34495e;
}

/* メインコンテンツスタイル */
.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* フッタースタイル */
.footer {
  background-color: #34495e;
  color: white;
  text-align: center;
  padding: 1rem;
  margin-top: auto;
}

/* 共通ユーティリティクラス */
.card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
}

.btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #2980b9;
}

.btn-success {
  background-color: #27ae60;
}

.btn-success:hover {
  background-color: #229954;
}

.btn-warning {
  background-color: #f39c12;
}

.btn-warning:hover {
  background-color: #e67e22;
}

.btn-danger {
  background-color: #e74c3c;
}

.btn-danger:hover {
  background-color: #c0392b;
}
</style>