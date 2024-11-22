import axios from 'axios';
import { endpoints } from '../config/api';
import { Room, Booking } from '../types/room';

export const roomApi = {
  // 获取所有会议室
  getRooms: async (): Promise<Room[]> => {
    const response = await axios.get(endpoints.rooms);
    return response.data;
  },

  // 获取指定时间段的预订信息
  getRoomBookings: async (startDate: string, endDate: string): Promise<Booking[]> => {
    const response = await axios.get(endpoints.getBookings(startDate, endDate));
    return response.data;
  },

  // 创建预订
  createBooking: async (bookingData: {
    roomId: string;
    title: string;
    startTime: string;
    endTime: string;
    attendees: number;
    purpose?: string;
  }): Promise<Booking> => {
    try {
      // 先检查时间冲突
      const existingBookings = await axios.get(
        `${endpoints.bookings}?roomId=${bookingData.roomId}&startDate=${bookingData.startTime}&endDate=${bookingData.endTime}`
      );

      const conflicts = existingBookings.data.filter((booking: Booking) => {
        const bookingStart = new Date(booking.startTime);
        const bookingEnd = new Date(booking.endTime);
        const newStart = new Date(bookingData.startTime);
        const newEnd = new Date(bookingData.endTime);

        return (
          (newStart >= bookingStart && newStart < bookingEnd) ||
          (newEnd > bookingStart && newEnd <= bookingEnd) ||
          (newStart <= bookingStart && newEnd >= bookingEnd)
        );
      });

      if (conflicts.length > 0) {
        throw new Error('该时间段已被预订');
      }

      // 如果没有冲突，创建预订
      const response = await axios.post(endpoints.createBooking, {
        ...bookingData,
        bookingStatus: 'APPROVED'
      });
      return response.data;
    } catch (error: any) {
      if (error.message === '该时间段已被预订') {
        throw error;
      }
      console.error('创建预订失败:', error);
      throw new Error(error.response?.data?.error || '创建预订失败');
    }
  },

  // 取消预订
  cancelBooking: async (bookingId: string): Promise<void> => {
    await axios.delete(endpoints.cancelBooking(bookingId));
  }
}; 