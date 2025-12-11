import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// 1. Buat instance Axios dengan konfigurasi dasar
const api: AxiosInstance = axios.create({
  // Mengambil URL dari environment variable, atau fallback ke localhost jika tidak ada
  baseURL: '/', 
  timeout: 10000, // Waktu tunggu maksimal 10 detik
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor (Opsional tapi Penting)
// Fungsi ini berjalan SEBELUM request dikirim ke backend.
// Berguna untuk menempelkan Token Login otomatis.
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Cek apakah ada token tersimpan di browser (jika aplikasi butuh login)
    // Pastikan ini berjalan hanya di sisi client
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token'); 
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor (Opsional)
// Fungsi ini berjalan SETELAH respon diterima dari backend.
// Berguna untuk menangani error global, misalnya jika token kadaluwarsa (401).
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Contoh: Jika error 401 (Unauthorized), lempar user kembali ke halaman login
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        // Hapus token dan redirect
        // localStorage.removeItem('token');
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;