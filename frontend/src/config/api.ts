export const API_BASE_URL = 'http://localhost:3000/api';

export const endpoints = {
  rooms: `${API_BASE_URL}/rooms`,
  room: (id: string) => `${API_BASE_URL}/rooms/${id}`,
  bookings: `${API_BASE_URL}/rooms/bookings`,
  createBooking: `${API_BASE_URL}/bookings`,
  getBookings: (startDate: string, endDate: string) => 
    `${API_BASE_URL}/rooms/bookings?startDate=${startDate}&endDate=${endDate}`,
  cancelBooking: (id: string) => `${API_BASE_URL}/bookings/${id}`,
  login: `${API_BASE_URL}/auth/login`,
  register: `${API_BASE_URL}/auth/register`,
  logout: `${API_BASE_URL}/auth/logout`
}; 