import { client } from "./api/client.gen";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5037";

// Bỏ trailing slash để tránh double-slash trong URL (e.g. //api/semesters)
client.setConfig({ baseURL: API_BASE_URL.replace(/\/+$/, "") });

// Tự động gắn Bearer token vào mỗi request
client.instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Xử lý lỗi 401 – hết hạn phiên đăng nhập
client.instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Phiên đăng nhập hết hạn.");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
