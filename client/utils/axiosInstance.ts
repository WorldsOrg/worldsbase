import axios from "axios";

const axiosConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY,
  },
};

 const axiosInstance = axios.create(axiosConfig);

 axiosInstance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response.status === 403) {
    localStorage.removeItem("token");
      window.location.href = '/auth';
    }
    return error.response;
  }
);


export default axiosInstance
