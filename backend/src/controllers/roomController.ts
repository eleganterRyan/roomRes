import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { BookingStatus } from '@prisma/client';

// 获取会议室列表
export const getRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        bookings: {
          where: {
            bookingStatus: {
              in: [BookingStatus.APPROVED, BookingStatus.PENDING]
            }
          }
        }
      }
    });
    res.json(rooms);
  } catch (error) {
    console.error('获取会议室失败:', error);
    res.status(500).json({ error: '获取会议室失败' });
  }
};

// 创建预订
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomId, title, startTime, endTime, attendees, purpose } = req.body;
    
    console.log('收到预订请求数据:', {
      roomId,
      title,
      startTime,
      endTime,
      attendees,
      purpose
    });

    // 查找默认管理员用户
    const adminUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (!adminUser) {
      res.status(400).json({ error: '系统错误：找不到默认用户' });
      return;
    }

    // 检查时间冲突
    const conflicts = await prisma.booking.findMany({
      where: {
        roomId,
        bookingStatus: BookingStatus.APPROVED,
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(startTime) } },
              { endTime: { gt: new Date(startTime) } }
            ]
          },
          {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gte: new Date(endTime) } }
            ]
          }
        ]
      }
    });
    
    if (conflicts.length > 0) {
      res.status(400).json({ error: '该时间段已被预订' });
      return;
    }

    // 创建预订
    const booking = await prisma.booking.create({
      data: {
        title,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        attendees: attendees || 1,
        purpose,
        bookingStatus: BookingStatus.APPROVED,
        room: { connect: { id: roomId } },
        user: { connect: { id: adminUser.id } }
      },
      include: {
        room: true,
        user: {
          select: {
            id: true,
            name: true,
            department: true
          }
        }
      }
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('创建预订失败:', error);
    res.status(500).json({ error: '创建预订失败' });
  }
};

// 获取预订信息
export const getRoomBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      res.status(400).json({ error: '缺少开始或结束日期' });
      return;
    }

    const bookings = await prisma.booking.findMany({
      where: {
        AND: [
          { startTime: { gte: new Date(startDate as string) } },
          { endTime: { lte: new Date(endDate as string) } }
        ]
      },
      include: {
        room: true,
        user: {
          select: {
            id: true,
            name: true,
            department: true
          }
        }
      }
    });

    res.json(bookings);
  } catch (error) {
    console.error('获取预订信息失败:', error);
    res.status(500).json({ error: '获取预订信息失败' });
  }
};

// 取消预订
export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const { userId } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true }
    });

    if (!booking) {
      res.status(404).json({ error: '预订不存在' });
      return;
    }

    if (booking.userId !== userId) {
      res.status(403).json({ error: '无权取消此预订' });
      return;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { bookingStatus: 'CANCELLED' },
      include: { room: true, user: true }
    });

    res.json(updatedBooking);
  } catch (err) {
    console.error('Error cancelling booking:', err);
    res.status(500).json({ error: '取消预订失败' });
  }
}; 