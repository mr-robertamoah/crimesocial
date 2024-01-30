import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true
window.axios.defaults.baseURL = import.meta.env.APP_URL || 'http://localhost:3000/api'