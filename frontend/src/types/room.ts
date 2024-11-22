// 会议室状态类型
export type RoomStatus = 'available' | 'maintenance' | 'occupied';

// 会议室设施类型
export type Facility = '投影仪' | 'WiFi' | '白板' | '视频会议系统' | '音响设备';

// 预订状态类型
export type BookingStatus = 'approved' | 'pending' | 'cancelled';

// 预订人信息接口
export interface Booker {
  id: string;
  name: string;
  department: string;
  email?: string;
  phone?: string;
}

// 预订记录接口
export interface Booking {
  id: string;
  roomId: string;
  title: string;
  startTime: string;
  endTime: string;
  attendees: number;
  purpose?: string;
  booker?: {
    id: string;
    name: string;
  };
}

// 会议室接口
export interface Room {
  id: string;
  name: string;
  capacity: number;
  facilities: string[];
  location: string;
  building: string;
  floor: number;
}

// 添加 BookingForm 接口
export interface BookingForm {
  title: string;
  startTime: string;
  endTime: string;
  attendees: number;
  purpose: string;
  applicant: string;
} 