import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || ''




const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, 
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    
    return Promise.reject(error);
  }
);

export default apiClient;