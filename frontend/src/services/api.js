import axios from 'axios';

const API = axios.create({
  // Gunakan Environment Variable Vercel, jika tidak ada baru fallback ke localhost
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export default API;