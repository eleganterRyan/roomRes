import React, { useState, useEffect, useRef } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { Room, Booking } from '../types/room';
import { roomApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import 'dayjs/locale/zh-cn';

const GuestView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 添加筛选条件状态
  const [filterEnabled, setFilterEnabled] = useState(false);
  const [capacityFilter, setCapacityFilter] = useState<number | null>(null);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

  // 所有可能的设施列表
  const allFacilities = ['投影仪', '白板', '视频会议系统', 'WiFi', '电视屏幕', '音响设备'];

  const filterPanelRef = useRef<HTMLDivElement>(null);

  // 添加点击外部关闭浮动窗口的处理函数
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
        setFilterEnabled(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomsData = await roomApi.getRooms();
        setRooms(roomsData);
        setFilteredRooms(roomsData);
      } catch (error) {
        console.error('获取会议室失败:', error);
      }
    };

    fetchRooms();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const startDate = currentDate.format('YYYY-MM-DD');
        const endDate = currentDate.add(1, 'day').format('YYYY-MM-DD');
        const bookingsData = await roomApi.getRoomBookings(startDate, endDate);
        setBookings(bookingsData);
      } catch (error) {
        console.error('获取预订信息失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentDate]);

  // 修改筛选逻辑
  useEffect(() => {
    let filtered = [...rooms];

    if (filterEnabled) {
      // 根据容量筛选
      if (capacityFilter !== null) {
        filtered = filtered.filter(room => room.capacity >= capacityFilter);
      }

      // 根据设施筛选
      if (selectedFacilities.length > 0) {
        filtered = filtered.filter(room =>
          selectedFacilities.every(facility => room.facilities.includes(facility))
        );
      }
    }

    setFilteredRooms(filtered);
  }, [rooms, capacityFilter, selectedFacilities, filterEnabled]);

  // 获取指定房间的预订时间段
  const getRoomTimeSlots = (roomId: string) => {
    return bookings.filter(booking => 
      booking.roomId === roomId && 
      dayjs(booking.startTime).isSame(currentDate, 'day')
    );
  };

  // 渲染时间轴
  const renderTimeline = (roomId: string) => {
    const timeSlots = getRoomTimeSlots(roomId);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="relative h-8 bg-blue-100 rounded overflow-hidden">
        {/* 时间刻度 */}
        <div className="absolute top-0 left-0 w-full h-full flex">
          {hours.map(hour => (
            <div
              key={hour}
              className="h-full border-l border-blue-200"
              style={{ width: `${100/24}%` }}
            />
          ))}
        </div>

        {/* 已预订时间段 */}
        {timeSlots.map(slot => {
          const start = dayjs(slot.startTime);
          const end = dayjs(slot.endTime);
          const startPercent = (start.hour() + start.minute() / 60) * (100/24);
          const duration = end.diff(start, 'hour', true) * (100/24);

          return (
            <div
              key={slot.id}
              className="absolute top-0 h-full bg-red-400"
              style={{
                left: `${startPercent}%`,
                width: `${duration}%`
              }}
              title={`${start.format('HH:mm')} - ${end.format('HH:mm')}`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* 顶部导航 */}
      <div className="bg-white shadow-md p-4 mb-4 rounded-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">会议室预订情况（游客模式）</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-800"
            >
              登录系统
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentDate(prev => prev.subtract(1, 'day'))}
                className="text-blue-600 hover:text-blue-800"
              >
                前一天
              </button>
              <input
                type="date"
                value={currentDate.format('YYYY-MM-DD')}
                onChange={(e) => setCurrentDate(dayjs(e.target.value))}
                className="text-lg font-medium px-2 py-1 border border-gray-200 rounded hover:border-blue-500 cursor-pointer"
              />
              <button
                onClick={() => setCurrentDate(prev => prev.add(1, 'day'))}
                className="text-blue-600 hover:text-blue-800"
              >
                后一天
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 筛选面板 */}
      <div className="bg-white shadow-md p-2 mb-3 rounded-lg">
        <div className="flex flex-wrap items-start gap-1">
          {/* 过滤模式标题和开关 */}
          <div className="flex flex-col gap-1 w-[100px] pt-2 mr-1">
            <h3 className="text-sm font-medium text-gray-600 h-[20px]">过滤模式</h3>
            <button
              onClick={() => setFilterEnabled(!filterEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                filterEnabled ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                  filterEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
                
          {/* 容量筛选 */}
          <div className={`space-y-1 p-2 border border-gray-200 rounded-lg transition-opacity duration-300 ${
            !filterEnabled ? 'opacity-50 pointer-events-none' : ''
          }`}>
            <label className="block text-sm font-medium text-gray-700">最小容量要求</label>
            <div className="flex flex-wrap gap-1">
              {[0, 10, 20, 30, 50].map(cap => (
                <button
                  key={cap}
                  onClick={() => setCapacityFilter(cap === 0 ? null : cap)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    capacityFilter === cap || (cap === 0 && capacityFilter === null)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  disabled={!filterEnabled}
                >
                  {cap === 0 ? '全部' : `${cap}人以上`}
                </button>
              ))}
            </div>
          </div>

          {/* 设施筛选 */}
          <div className={`space-y-1 p-2 border border-gray-200 rounded-lg transition-opacity duration-300 ${
            !filterEnabled ? 'opacity-50 pointer-events-none' : ''
          }`}>
            <label className="block text-sm font-medium text-gray-700">设施要求</label>
            <div className="flex flex-wrap gap-1">
              {allFacilities.map(facility => (
                <button
                  key={facility}
                  onClick={() => {
                    setSelectedFacilities(prev =>
                      prev.includes(facility)
                        ? prev.filter(f => f !== facility)
                        : [...prev, facility]
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedFacilities.includes(facility)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  disabled={!filterEnabled}
                >
                  {facility}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRooms.map(room => (
            <div key={room.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold">{room.name}</h2>
                  <p className="text-sm text-gray-500">
                    容纳: {room.capacity}人 | {room.building} {room.floor}层
                  </p>
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
              </div>

              {/* 时间轴 */}
              <div className="relative mt-4">
                {renderTimeline(room.id)}
                {/* 时间刻度标签 */}
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24].map(hour => (
                    <span key={hour} style={{ left: `${(hour/24) * 100}%` }}>
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuestView; 