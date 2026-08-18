import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api', // Đường dẫn Backend Spring Boot
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor cho Request: Gắn token vào header
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    // Trả về thẳng payload result của API Response từ Backend
    if (response.data && response.data.result !== undefined) {
      return response.data.result;
    }
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;

    // Nếu lỗi 401 Unauthorized HOẶC mã lỗi là 1008 (UNAUTHENTICATED)
    if (status === 401 || code === 1008) {
      const url = error.config?.url;
      const isAuthUrl = url?.includes('/auth/me') || url?.includes('/auth/refresh');
      
      // Token hết hạn hoặc không hợp lệ, xóa token và đẩy về login
      // Chỉ logout nếu đây là API xác thực (auth/me) hoặc backend trả về rõ mã 1008
      if (window.location.pathname !== '/login' && (isAuthUrl || code === 1008)) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    // Ném lỗi về để catch ở cấp view/viewmodel xử lý hiển thị Toast
    const message = error.response?.data?.message || 'Có lỗi xảy ra kết nối với máy chủ';
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
