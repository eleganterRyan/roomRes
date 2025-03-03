// 获取当前主机的 IP 地址和端口
const API_HOST = window.location.hostname;  // 自动获取当前主机名
const API_PORT = '3000';  // 后端端口

export const API_BASE_URL = `http://${API_HOST}:${API_PORT}/api`;

export const endpoints = {
  rooms: `${API_BASE_URL}/rooms`,
  bookings: `${API_BASE_URL}/bookings`,
  createBooking: `${API_BASE_URL}/bookings`,
  getBookings: (startDate: string, endDate: string) => 
    `${API_BASE_URL}/bookings?startDate=${startDate}&endDate=${endDate}`,
  cancelBooking: (id: string) => `${API_BASE_URL}/bookings/${id}`,
  login: `${API_BASE_URL}/auth/login`,
  register: `${API_BASE_URL}/auth/register`,
  logout: `${API_BASE_URL}/auth/logout`
}; 