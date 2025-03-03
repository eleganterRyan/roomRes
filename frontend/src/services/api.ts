import axios from 'axios';
import { endpoints } from '../config/api';
import { Room, Booking, CreateBookingRequest } from '../types/room';

// 修改请求拦截器，添加调试信息
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('发送请求前的 token:', token);
  
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    console.log('请求头:', config.headers);
  } else {
    console.warn('没有找到 token！');
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 添加响应拦截器
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // token 失效，清除 token 并跳转到登录页
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const roomApi = {
  // 获取所有会议室
  getRooms: async (): Promise<Room[]> => {
    try {
      const response = await axios.get(endpoints.rooms);
      return response.data;
    } catch (error) {
      console.error('获取会议室失败:', error);
      throw error;
    }
  },

  // 获取指定时间段的预订信息
  getRoomBookings: async (startDate: string, endDate: string): Promise<Booking[]> => {
    try {
      const response = await axios.get(endpoints.getBookings(startDate, endDate));
      return response.data;
    } catch (error) {
      console.error('获取预订信息失败:', error);
      throw error;
    }
  },

  // 创建预订
  createBooking: async (data: CreateBookingRequest): Promise<Booking> => {
    try {
      const response = await axios.post(endpoints.createBooking, data);
      return response.data;
    } catch (error) {
      console.error('创建预订失败:', error);
      throw error;
    }
  },

  // 取消预订
  cancelBooking: async (bookingId: string): Promise<void> => {
    try {
      console.log('发送取消预订请求:', bookingId);
      const response = await axios.delete(endpoints.cancelBooking(bookingId));
      console.log('取消预订响应:', response);
      return response.data;
    } catch (error: any) {
      console.error('取消预订请求失败:', error);
      if (error.response) {
        console.error('错误响应数据:', error.response.data);
        console.error('错误状态码:', error.response.status);
      }
      throw error;
    }
  }
}; 