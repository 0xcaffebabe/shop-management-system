import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'

import VueQuillEditor from 'vue-quill-editor'

import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

Vue.use(VueQuillEditor)

Vue.prototype.$http = axios
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)
Vue.filter('dateFormat', origin => {
  const date = new Date(origin)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDay() + 1} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
