import React, { useState, useEffect, useCallback, useRef } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import 'dayjs/locale/zh-cn';
import { Room, Booking, BookingForm } from '../types/room';
import { roomApi } from '../services/api';
import './RoomBooking.css';
import { getDateInfo } from '../utils/chineseCalendar';

// 配置 dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.locale('zh-cn');                    // 设置语言为中文
dayjs.tz.setDefault('Asia/Shanghai');     // 设置默认时区为中国时区

interface TimelineProps {
  bookingForm: BookingForm;
  setBookingForm: React.Dispatch<React.SetStateAction<BookingForm>>;
}

const RoomBooking: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState<Dayjs>(dayjs().tz());
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    title: '',
    startTime: '',
    endTime: '',
    attendees: 1,
    purpose: '',
    applicant: ''
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomsData = await roomApi.getRooms();
        console.log('Fetched rooms:', roomsData);
        setRooms(roomsData);
      } catch (error) {
        console.error('获取会议室失败:', error);
        // 这里可以添加错误提示
      }
    };

    fetchRooms();
  }, []);

  useEffect(() => {
    fetchBookings(currentWeek, setLoading, setBookings);
  }, [currentWeek]);

  // 获取指定日期的预订信息
  const getDayBookings = (roomId: string, date: Dayjs) => {
    return bookings
      .filter(booking => 
        booking.roomId === roomId && 
        dayjs(booking.startTime).isSame(date, 'day')
      )
      .sort((a, b) => {
        // 按开始时间升序排序
        const timeA = dayjs(a.startTime);
        const timeB = dayjs(b.startTime);
        if (timeA.isBefore(timeB)) return -1;
        if (timeA.isAfter(timeB)) return 1;
        return 0;
      });
  };

  // 生成一周的日期
  const weekDays = Array.from({ length: 7 }, (_, i) => 
    currentWeek.startOf('week').add(i, 'day')
  );

  // 获取时间段显示
  const getTimeSlot = (time: string) => {
    return time.split(' - ').map(t => 
      dayjs(t, 'HH:mm').format('HH:mm')
    ).join(' - ');
  };

  // 添加预订处理函数
  const handleBookingClick = (room: Room, date: Dayjs) => {
    setSelectedRoom(room);
    setSelectedDate(date);
    setBookingForm(prev => ({
      ...prev,
      startTime: '09:00',
      endTime: '10:00'
    }));
    setShowBookingModal(true);
  };

  // 修改预订提交函数
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !selectedDate) return;

    // 添加时间格式验证
    if (!bookingForm.startTime || !bookingForm.endTime) {
      alert('请选择预订时间');
      return;
    }

    // 验证时间范围是否在工作时间内
    const [startHour] = bookingForm.startTime.split(':').map(Number);
    const [endHour] = bookingForm.endTime.split(':').map(Number);
    if (startHour < 8 || endHour > 22) {
      alert('预订时间必须在 8:00-22:00 之间');
      return;
    }

    try {
      const startDateTime = dayjs(`${selectedDate.format('YYYY-MM-DD')} ${bookingForm.startTime}`);
      const endDateTime = dayjs(`${selectedDate.format('YYYY-MM-DD')} ${bookingForm.endTime}`);

      // 表单验证
      if (startDateTime.isAfter(endDateTime)) {
        alert('结束时间必须晚于开始时间');
        return;
      }

      if (bookingForm.attendees > selectedRoom.capacity) {
        alert(`参会人数不能超过会议室容量 ${selectedRoom.capacity} 人`);
        return;
      }

      // 检查当前时间段是否已有预订
      const dayBookings = getDayBookings(selectedRoom.id, selectedDate);
      const hasConflict = dayBookings.some(booking => {
        const bookingStart = dayjs(booking.startTime);
        const bookingEnd = dayjs(booking.endTime);
        return (
          (startDateTime.isSame(bookingStart) || startDateTime.isAfter(bookingStart)) &&
          startDateTime.isBefore(bookingEnd)
        ) || (
          (endDateTime.isSame(bookingEnd) || endDateTime.isBefore(bookingEnd)) &&
          endDateTime.isAfter(bookingStart)
        );
      });

      if (hasConflict) {
        alert('该时间段已被预订，请选择其他时间');
        return;
      }

      await roomApi.createBooking({
        roomId: selectedRoom.id,
        title: bookingForm.title,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        attendees: bookingForm.attendees,
        purpose: bookingForm.purpose,
        applicant: bookingForm.applicant
      });

      alert('预订成功！');
      setShowBookingModal(false);
      setBookingForm({
        title: '',
        startTime: '',
        endTime: '',
        attendees: 1,
        purpose: '',
        applicant: ''
      });
      
      // 刷新预订数据
      await fetchBookings(currentWeek, setLoading, setBookings);
      
    } catch (error: any) {
      console.error('预订失败:', error);
      alert(error.message || '预订失败，请重试');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* 顶部导航 */}
      <div className="bg-white shadow-md p-4 mb-4 rounded-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">会议场地预订情况</h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setCurrentWeek(currentWeek.subtract(1, 'week'))}
              className="text-blue-600 hover:text-blue-800"
            >
              {'<< 上一周'}
            </button>
            <span className="text-lg font-medium">
              {currentWeek.startOf('week').format('YYYY年MM月DD日')} 至 {currentWeek.endOf('week').format('YYYY年MM月DD日')}
            </span>
            <button 
              onClick={() => setCurrentWeek(currentWeek.add(1, 'week'))}
              className="text-blue-600 hover:text-blue-800"
            >
              {'下一周 >>'}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-3 border bg-gray-50 min-w-[120px] sticky left-0 z-10 bg-white">
                  <div className="font-bold">场地</div>
                  <div className="text-xs text-gray-500 mt-1">点击查看详情</div>
                </th>
                {weekDays.map(day => {
                  const specialDay = getDateInfo(day);
                  return (
                    <th key={day.format()} className="p-3 border bg-gray-50 min-w-[200px]">
                      <div>{day.format('MM-DD')}</div>
                      <div className="text-sm text-gray-500">{day.format('dddd')}</div>
                      {specialDay && (
                        <div className="text-xs text-red-500 mt-1">
                          {specialDay}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            
            <tbody>
              {rooms.map(room => (
                <tr key={room.id} className="hover:bg-gray-50">
                  <td className="p-3 border font-medium sticky left-0 bg-white hover:bg-gray-50 cursor-pointer">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">{room.name}</span>
                      <span className="text-xs text-gray-500">
                        容纳: {room.capacity}人 | {room.building}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {room.facilities.map((facility, index) => (
                          <span 
                            key={index}
                            className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
                          >
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  {weekDays.map(day => (
                    <td 
                      key={day.format()} 
                      className="p-3 border relative min-h-[120px] align-top cursor-pointer hover:bg-gray-50"
                      onClick={() => handleBookingClick(room, day)}
                    >
                      <div className="space-y-1">
                        {getDayBookings(room.id, day).map(booking => (
                          <div 
                            key={booking.id}
                            className="bg-blue-100 text-blue-800 p-2 rounded text-sm cursor-pointer
                                     hover:bg-blue-200 transition-colors duration-200"
                            title={`预订人: ${booking.booker?.name || '未知'}`}
                            style={{
                              position: 'relative',
                              zIndex: 1
                            }}
                          >
                            <div className="font-medium">
                              {dayjs(booking.startTime).format('HH:mm')} - 
                              {dayjs(booking.endTime).format('HH:mm')}
                            </div>
                            <div className="text-xs mt-1 font-medium truncate">
                              {booking.title}
                            </div>
                            {booking.purpose && (
                              <div className="text-xs text-blue-600 truncate">
                                {booking.purpose}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 预订按钮 */}
      <div className="mt-4 flex justify-end">
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   transition-colors duration-200"
          onClick={() => {/* 处理预订逻辑 */}}
        >
          预订会议室
        </button>
      </div>

      {/* 添加预订表单模态框 */}
      {showBookingModal && selectedRoom && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative z-50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                预订 {selectedRoom.name}
              </h2>
              <span className="text-gray-500">
                {dayjs(selectedDate).format('YYYY-MM-DD')}
              </span>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-6">
              {/* 会议主题 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">会议主题</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {[
                    '部门周会',
                    '项目讨论',
                    '客户会议',
                    '团队培训',
                    '面试',
                    '其他'
                  ].map(title => (
                    <button
                      key={title}
                      type="button"
                      onClick={() => setBookingForm({...bookingForm, title})}
                      className={`px-3 py-1 rounded-full text-sm ${
                        bookingForm.title === title
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {title}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={bookingForm.title}
                  onChange={e => setBookingForm({...bookingForm, title: e.target.value})}
                  placeholder="自定义会议主题"
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* 添加申请人输入框 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">申请人</label>
                <input
                  type="text"
                  value={bookingForm.applicant}
                  onChange={e => setBookingForm({...bookingForm, applicant: e.target.value})}
                  placeholder="请输入申请人姓名"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              {/* 时间选择部分 - 调整间距 */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">预订时间</label>
                <Timeline 
                  bookingForm={bookingForm} 
                  setBookingForm={setBookingForm} 
                />
              </div>

              {/* 参会人数 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">参会人数</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {[10, 20, 30, 50, 100, 200, 500].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBookingForm({...bookingForm, attendees: num})}
                      className={`px-3 py-1 rounded-full text-sm ${
                        bookingForm.attendees === num
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {num}人
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={bookingForm.attendees || ''}
                  onChange={e => setBookingForm({...bookingForm, attendees: parseInt(e.target.value) || 0})}
                  placeholder="自定义人数"
                  min="1"
                  max={selectedRoom.capacity}
                  className="w-full p-2 border rounded"
                />
                <div className="text-xs text-gray-500">
                  会议室最大容纳: {selectedRoom.capacity}人
                </div>
              </div>

              {/* 添加会议用途/备注输入框 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">会议用途</label>
                <textarea
                  value={bookingForm.purpose}
                  onChange={e => setBookingForm({...bookingForm, purpose: e.target.value})}
                  placeholder="请简要说明会议用途"
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-md"
                >
                  确认预订
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 将 fetchBookings 函数提取到组件外部
const fetchBookings = async (currentWeek: Dayjs, setLoading: Function, setBookings: Function) => {
  try {
    setLoading(true);
    const startDate = currentWeek.startOf('week').format('YYYY-MM-DD');
    const endDate = currentWeek.endOf('week').format('YYYY-MM-DD');
    const bookingsData = await roomApi.getRoomBookings(startDate, endDate);
    console.log('Fetched bookings:', bookingsData);
    setBookings(bookingsData);
  } catch (error) {
    console.error('获取预订信息失败:', error);
    // 里可以添加错误提示
  } finally {
    setLoading(false);
  }
};

// 添加辅助函数
const generateTimeOptions = () => {
  const times = [];
  const start = 8; // 8:00
  const end = 22; // 22:00

  for (let hour = start; hour < end; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      times.push(
        `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      );
    }
  }
  return times;
};

const getDuration = (startTime: string, endTime: string) => {
  if (!startTime || !endTime) return '60';
  const start = dayjs(`2024-01-01 ${startTime}`);
  const end = dayjs(`2024-01-01 ${endTime}`);
  return end.diff(start, 'minute').toString();
};

// 添加时间轴相关的辅助函数
const getTimePosition = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  const startMinutes = 8 * 60; // 8:00
  const totalDayMinutes = 14 * 60; // 14 hours (8:00-22:00)
  return ((totalMinutes - startMinutes) / totalDayMinutes) * 100;
};

const getTimeDuration = (startTime: string, endTime: string) => {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  const durationMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
  const totalDayMinutes = 14 * 60; // 14 hours (8:00-22:00)
  return (durationMinutes / totalDayMinutes) * 100;
};

const formatTime = (time: string) => {
  return time.slice(0, 5);
};

// 添加相关的 CSS 样式
const timeAxisStyles = {
  timeAxis: {
    position: 'relative' as const,
    height: '60px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    padding: '10px 0',
    marginBottom: '20px'
  },
  timeMarkers: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'absolute' as const,
    width: '100%',
    bottom: '-20px',
    fontSize: '12px',
    color: '#666'
  },
  slider: {
    position: 'absolute' as const,
    height: '40px',
    backgroundColor: '#1976d2',
    borderRadius: '4px',
    cursor: 'move',
    userSelect: 'none' as const,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px'
  },
  handle: {
    position: 'absolute' as const,
    top: '0',
    bottom: '0',
    width: '12px',
    backgroundColor: '#1565c0',
    cursor: 'ew-resize',
    borderRadius: '4px'
  }
};

// 修改 Timeline 组件的 props 类型
const Timeline: React.FC<TimelineProps> = ({ bookingForm, setBookingForm }) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);

  // 将时间转换为位置百分比
  const timeToPercent = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = 8 * 60; // 8:00
    const endMinutes = 22 * 60; // 22:00
    return ((totalMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
  };

  // 将位置百分比转换为时间
  const percentToTime = (percent: number) => {
    const startMinutes = 8 * 60; // 8:00
    const endMinutes = 22 * 60; // 22:00
    const totalMinutes = startMinutes + (percent / 100) * (endMinutes - startMinutes);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round((totalMinutes % 60) / 30) * 30;
    
    // 使用中国时区创建时间
    return dayjs()
      .tz()
      .hour(hours)
      .minute(minutes)
      .format('HH:mm');
  };

  // 处理时间轴点击
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    const clickedTime = percentToTime(percent);
    
    // 根据点击位置更新开始或结束时间
    if (!bookingForm.startTime || !bookingForm.endTime) {
      setBookingForm(prev => ({ ...prev, startTime: clickedTime, endTime: clickedTime }));
    } else {
      const startPercent = timeToPercent(bookingForm.startTime);
      const endPercent = timeToPercent(bookingForm.endTime);
      const clickPercent = percent;
      
      if (Math.abs(clickPercent - startPercent) < Math.abs(clickPercent - endPercent)) {
        setBookingForm(prev => ({ ...prev, startTime: clickedTime }));
      } else {
        setBookingForm(prev => ({ ...prev, endTime: clickedTime }));
      }
    }
  };

  // 处理鼠标移动
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(((e.clientX - rect.left) / rect.width) * 100, 100));
    const newTime = percentToTime(percent);

    setBookingForm(prev => ({
      ...prev,
      [isDragging === 'start' ? 'startTime' : 'endTime']: newTime
    }));
  }, [isDragging, setBookingForm]);

  // 处理鼠标释放
  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  // 添加和移除事件监听器
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="space-y-6">
      <div 
        ref={timelineRef}
        className="relative h-16 bg-gray-100 rounded-lg cursor-pointer select-none"
        onClick={handleTimelineClick}
      >
        {/* 时间刻度 - 修改显示格式只显示小时 */}
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className="absolute -bottom-6 transform -translate-x-1/2 text-xs text-gray-500 select-none"
            style={{ left: `${(i / 14) * 100}%` }}
          >
            {`${i + 8}`} {/* 只显示小时数 */}
          </div>
        ))}

        {/* 选中时间段 */}
        {bookingForm.startTime && bookingForm.endTime && (
          <div
            className="absolute top-2 h-12 bg-blue-500 opacity-30 rounded"
            style={{
              left: `${timeToPercent(bookingForm.startTime)}%`,
              width: `${timeToPercent(bookingForm.endTime) - timeToPercent(bookingForm.startTime)}%`
            }}
          />
        )}

        {/* 开始时间手柄 */}
        {bookingForm.startTime && (
          <>
            {/* 扩大的触发区域 */}
            <div
              className="absolute top-0 h-16 cursor-ew-resize"
              style={{ 
                left: `${timeToPercent(bookingForm.startTime)}%`,
                width: '20px',  // 增加触发区域宽度
                transform: 'translateX(-50%)',
                zIndex: 2
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsDragging('start');
              }}
            />
            {/* 可见的手柄 */}
            <div
              className="absolute top-0 bg-blue-500 hover:bg-blue-600 transition-colors pointer-events-none"
              style={{ 
                left: `${timeToPercent(bookingForm.startTime)}%`,
                height: '64px',
                width: isDragging === 'start' ? '6px' : '4px',  // 增加手柄宽度
                transform: 'translateX(-50%)',
                borderRadius: '3px'
              }}
            />
          </>
        )}

        {/* 结束时间手柄 */}
        {bookingForm.endTime && (
          <>
            {/* 扩大的触发区域 */}
            <div
              className="absolute top-0 h-16 cursor-ew-resize"
              style={{ 
                left: `${timeToPercent(bookingForm.endTime)}%`,
                width: '20px',  // 增加触发区域宽度
                transform: 'translateX(-50%)',
                zIndex: 2
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsDragging('end');
              }}
            />
            {/* 可见的手柄 */}
            <div
              className="absolute top-0 bg-blue-500 hover:bg-blue-600 transition-colors pointer-events-none"
              style={{ 
                left: `${timeToPercent(bookingForm.endTime)}%`,
                height: '64px',
                width: isDragging === 'end' ? '6px' : '4px',  // 增加手柄宽度
                transform: 'translateX(-50%)',
                borderRadius: '3px'
              }}
            />
          </>
        )}
      </div>

      {/* 快速时间选择按钮 - 增加上边距 */}
      <div className="flex gap-2 justify-center select-none mt-8">
        {[30, 60, 90, 120].map(duration => (
          <button
            key={duration}
            type="button"
            onClick={() => {
              if (!bookingForm.startTime) return;
              const startDate = dayjs(`2000-01-01 ${bookingForm.startTime}`).tz();
              const endTime = startDate.add(duration, 'minute');
              
              setBookingForm(prev => ({
                ...prev,
                endTime: endTime.format('HH:mm')
              }));
            }}
            className={`px-3 py-1 rounded-full text-sm select-none ${
              bookingForm.startTime && bookingForm.endTime &&
              dayjs(`2000-01-01 ${bookingForm.endTime}`).diff(dayjs(`2000-01-01 ${bookingForm.startTime}`), 'minute') === duration
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {duration >= 60 ? `${duration / 60}小时` : `${duration}分钟`}
          </button>
        ))}
      </div>

      {/* 当前选择的时间显示 */}
      <div className="text-center text-sm text-gray-600 select-none">
        当前选择: {bookingForm.startTime} - {bookingForm.endTime}
      </div>
    </div>
  );
};

export default RoomBooking; 