import axios from "axios";

// Get the base URL from environment or default
const VITE_BASEURL =
  import.meta.env.VITE__BASEURL || "https://api-hrms-backend.kyptronix.us";

console.log("🌍 API Base URL:", VITE_BASEURL);

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: VITE_BASEURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        `❌ Response Error: ${error.response.status} ${error.config.url}`,
        error.response.data
      );
    } else if (error.request) {
      console.error("❌ No Response - Network Error:", error.message);
    } else {
      console.error("❌ Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
