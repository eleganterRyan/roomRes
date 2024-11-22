import React, { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import { endpoints, API_BASE_URL } from '../config/api';
import './BookingCalendar.css';  // 导入 CSS 文件

interface Room {
  id: string;
  name: string;
  capacity: number;
  facilities: string[];
  location: string;
  roomStatus: string;
  floor: number;
  building: string;
  description: string;
  bookings: any[];
}

interface BookingFormData {
  title: string;
  startTime: string;
  endTime: string;
  attendees: number;
  purpose: string;
}

const BookingCalendar = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState<BookingFormData>({
    title: '',
    startTime: '',
    endTime: '',
    attendees: 0,
    purpose: ''
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    startTime: string;
    endTime: string;
  } | null>(null);

  const fetchRooms = async () => {
    try {
      console.log('开始获取会议室数据');
      const response = await axios.get(endpoints.rooms, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('获取到的会议室数据:', response.data);
      setRooms(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error('获取会议室数据失败:', err);
      setError(err.message || '获取会议室数据失败');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    console.log('rooms 数据更新:', rooms);
  }, [rooms]);

  const handleBooking = async (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    setSelectedRoom(room || null);
    setShowBookingForm(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    // 表单验证
    if (!bookingData.title.trim()) {
      alert('请输入会议主题');
      return;
    }

    if (bookingData.attendees <= 0 || bookingData.attendees > selectedRoom.capacity) {
      alert(`参会人数必须在 1-${selectedRoom.capacity} 人之间`);
      return;
    }

    const startTime = new Date(bookingData.startTime);
    const endTime = new Date(bookingData.endTime);

    if (startTime >= endTime) {
      alert('结束时间必须晚于开始时间');
      return;
    }

    try {
      // 获取当前登录用户信息（这里暂时使用管理员账号）
      const adminUser = {
        username: 'admin',
        password: 'admin123'
      };

      const authResponse = await axios.post(endpoints.login, adminUser);
      const userId = authResponse.data.user.id;

      const bookingRequest = {
        roomId: selectedRoom.id,
        userId,
        title: bookingData.title,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        attendees: bookingData.attendees,
        purpose: bookingData.purpose
      };

      const response = await axios.post(endpoints.createBooking, bookingRequest);

      if (response.data) {
        alert('预订成功！');
        setShowBookingForm(false);
        // 重置表单数据
        setBookingData({
          title: '',
          startTime: '',
          endTime: '',
          attendees: 0,
          purpose: ''
        });
        setSelectedTimeSlot(null);
        // 刷新会议室数据
        await fetchRooms();
      }
    } catch (err: any) {
      console.error('预订失败:', err);
      alert(err.response?.data?.message || '预订失败，请重试');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await axios.delete(endpoints.cancelBooking(bookingId), {
        data: { userId: '当前用户ID' } // 需要从登录状态获取
      });

      if (response.data) {
        alert('预订已取消');
        await fetchRooms(); // 刷新会议室列表
      }
    } catch (err: any) {
      console.error('取消预订失败:', err);
      alert(err.response?.data?.error || '取消预订失败，请重试');
    }
  };

  // 生成时间段
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 8; // 从早上8点开始
    const endHour = 22; // 到晚上10点结束
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push({
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`
      });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // 修改点击处理函数的定义
  const handleTimeSlotClick = (room: Room, dayIndex: number) => {
    console.log('点击了格子:', { room, dayIndex }); // 添加调试日志
    
    // 根据 dayIndex 计算对应的日期
    const clickedDate = new Date(selectedDate);
    clickedDate.setDate(clickedDate.getDate() - clickedDate.getDay() + dayIndex);
    
    console.log('计算得到的日期:', clickedDate); // 添加调试日志
    
    setSelectedTimeSlot({
      startTime: '09:00',
      endTime: '10:00'
    });
    setSelectedRoom(room);
    
    // 设置预订表单的初始数据
    const startDateTime = new Date(clickedDate);
    startDateTime.setHours(9, 0, 0);
    
    const endDateTime = new Date(clickedDate);
    endDateTime.setHours(10, 0, 0);

    const formData = {
      title: '',
      startTime: startDateTime.toISOString().slice(0, 16),
      endTime: endDateTime.toISOString().slice(0, 16),
      attendees: 1,
      purpose: ''
    };
    
    console.log('设置表单数据:', formData); // 添加调试日志
    
    setBookingData(formData);
    setShowBookingForm(true);
  };

  // 监听 showBookingForm 的变化
  useEffect(() => {
    console.log('showBookingForm 状态:', showBookingForm);
  }, [showBookingForm]);

  // 监听 selectedRoom 的变化
  useEffect(() => {
    console.log('selectedRoom 状态:', selectedRoom);
  }, [selectedRoom]);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div className="booking-calendar">
      <div className="calendar-container">
        {/* 会议室和时间格子表格 */}
        <div className="time-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'auto repeat(7, 1fr)', // 修改为7列，对应一周
          gap: '1px',
          backgroundColor: '#f5f5f5',
          border: '1px solid #e0e0e0'
        }}>
          {/* 表头 - 显示日期 */}
          <div style={{ padding: '12px', fontWeight: 'bold', backgroundColor: '#fff' }}>
            会议室
          </div>
          {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map((day, index) => (
            <div key={index} style={{
              padding: '12px',
              fontWeight: 'bold',
              backgroundColor: '#fff',
              textAlign: 'center'
            }}>
              {day}
            </div>
          ))}

          {/* 会议室列表 */}
          {rooms.map(room => (
            <React.Fragment key={room.id}>
              {/* 会议室信息 */}
              <div style={{
                padding: '12px',
                backgroundColor: '#fff',
                borderBottom: '1px solid #e0e0e0'
              }}>
                <div>{room.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  容量: {room.capacity}人
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  设施: {room.facilities.join(', ')}
                </div>
              </div>

              {/* 一周的预订格子 */}
              {Array(7).fill(null).map((_, dayIndex) => {
                // 计算当前格子的日期
                const cellDate = new Date(selectedDate);
                cellDate.setDate(cellDate.getDate() - cellDate.getDay() + dayIndex);
                
                // 检查该日期是否有预订
                const dayBookings = room.bookings.filter(b => {
                  const bookingDate = new Date(b.startTime);
                  return bookingDate.toDateString() === cellDate.toDateString();
                });

                return (
                  <div
                    key={dayIndex}
                    className="booking-cell"
                    onClick={(e) => {
                      console.log('格子被点击');  // 添加这行
                      e.preventDefault();
                      handleTimeSlotClick(room, dayIndex);
                    }}
                    style={{
                      padding: '8px',
                      backgroundColor: '#fff',
                      border: '1px solid #e0e0e0',
                      cursor: 'pointer',
                      minHeight: '100px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    {/* 显示日期 */}
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#666',
                      textAlign: 'center',
                      marginBottom: '4px'
                    }}>
                      {cellDate.getDate()}日
                    </div>

                    {/* 显示预订状态 */}
                    {dayBookings.length > 0 ? (
                      <div style={{ 
                        backgroundColor: '#ffebee',
                        padding: '4px',
                        borderRadius: '4px',
                        textAlign: 'center',
                        fontSize: '12px'
                      }}>
                        <div style={{ color: '#d32f2f' }}>已订</div>
                        {dayBookings.map((booking, idx) => (
                          <div key={idx} style={{ fontSize: '10px', marginTop: '4px' }}>
                            {booking.title}
                            {booking.userId === '当前用户ID' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelBooking(booking.id);
                                }}
                                style={{
                                  fontSize: '10px',
                                  padding: '2px 4px',
                                  marginTop: '4px',
                                  backgroundColor: '#d32f2f',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '2px',
                                  cursor: 'pointer'
                                }}
                              >
                                取消预订
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div 
                        className="available-slot"
                        style={{
                          backgroundColor: '#e8f5e9',
                          padding: '4px',
                          borderRadius: '4px',
                          textAlign: 'center',
                          fontSize: '12px',
                          color: '#2e7d32',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <span>可预订</span>
                        <span style={{ fontSize: '10px', marginTop: '4px' }}>
                          点击预约
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* 预订表单弹窗 */}
        {showBookingForm && selectedRoom && (
          <div className="booking-modal">
            <div className="booking-form">
              <h2 className="text-xl mb-4">预订 {selectedRoom.name}</h2>
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {/* 简化的预订表单 */}
                <div className="grid grid-cols-1 gap-4">
                  {/* 会议主题 */}
                  <div>
                    <input
                      type="text"
                      value={bookingData.title}
                      onChange={e => setBookingData({...bookingData, title: e.target.value})}
                      placeholder="会议主题"
                      required
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  {/* 时间选择器 - 使用预设时间段 */}
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={bookingData.startTime}
                      onChange={e => {
                        const startTime = e.target.value;
                        // 自动设置结束时间为开始时间后1小时
                        const endTime = new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString().slice(0, 16);
                        setBookingData({
                          ...bookingData,
                          startTime,
                          endTime
                        });
                      }}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">选择开始时间</option>
                      <option value="09:00">09:00</option>
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                    </select>

                    <div className="text-gray-500 flex items-center">
                      时长：1小时
                    </div>
                  </div>

                  {/* 参会人数 - 使用快捷选择 */}
                  <div className="flex gap-2">
                    {[1, 2, 5, 10].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setBookingData({...bookingData, attendees: num})}
                        className={`px-3 py-1 rounded ${
                          bookingData.attendees === num 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100'
                        }`}
                      >
                        {num}人
                      </button>
                    ))}
                  </div>

                  {/* 用途快捷选择 */}
                  <div className="flex gap-2 flex-wrap">
                    {['日常会议', '项目评审', '客户洽谈', '团队研讨'].map(purpose => (
                      <button
                        key={purpose}
                        type="button"
                        onClick={() => setBookingData({...bookingData, purpose})}
                        className={`px-3 py-1 rounded ${
                          bookingData.purpose === purpose 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100'
                        }`}
                      >
                        {purpose}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    确认预订
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCalendar; 