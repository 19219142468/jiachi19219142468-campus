import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
  console.error('Vue全局错误:', err)
  console.error('组件实例:', instance)
  console.error('错误信息:', info)
}

window.onerror = (message, source, lineno, colno, error) => {
  console.error('全局JS错误:', { message, source, lineno, colno, error })
}

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise拒绝:', event.reason)
})

app.use(createPinia())
app.use(router)
app.mount('#app')
