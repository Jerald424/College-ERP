import axios from "axios";

const axiosInstance = axios.create();
if (import.meta.env.MODE === "development") axiosInstance.defaults.baseURL = "/dev";
else axiosInstance.defaults.baseURL = "https://college-react-express.vercel.app/";

axiosInstance.interceptors.response.use(
  (response) => {
    return response?.data;
  },
  (error) => {
    return Promise.reject(error?.response?.data);
  }
);

export default axiosInstance;
