import axios from 'axios';

// Thay bằng địa chỉ IPv4 máy tính của bạn
const YOUR_LOCAL_IP = '192.168.1.8'; 

const apiClient = axios.create({
  baseURL: `http://${YOUR_LOCAL_IP}/coffee_api`,
  timeout: 10000,
});

export default apiClient;