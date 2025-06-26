import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// アプリケーションのエントリーポイント
const app = createApp(App)

// ルーターを使用
app.use(router)

// アプリをマウント
app.mount('#app')