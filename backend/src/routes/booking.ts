import express from 'express';
import { PrismaClient, Prisma , Room } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// 获取所有会议室
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      where: {
        roomStatus: 'available'
      }
    });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: '获取会议室失败' });
  }
});

// 创建预定
router.post('/bookings', authenticateToken, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '未授权' });
  }

  const { roomId, startTime, endTime, title, attendees } = req.body;
  const userId = req.user.id;

  try {
    // 检查时间段是否已被预定
    const existingBooking = await prisma.booking.findFirst({
      where: {
        roomId,
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

    if (existingBooking) {
      return res.status(400).json({ error: '该时间段已被预定' });
    }

    const bookingData: Prisma.BookingCreateInput = {
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      meetingTitle: String(title),
      numberOfAttendees: Number(attendees),
      bookingStatus: 'pending',
      room: {
        connect: { id: roomId }
      },
      user: {
        connect: { id: userId }
      }
    };

    // 创建预定
    const booking = await prisma.booking.create({
      data: bookingData,
      include: {
        room: true,
        user: true
      }
    });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: '创建预定失败' });
  }
});

// 获取用户的预定记录
router.get('/bookings/my', authenticateToken, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '未授权' });
  }

  const userId = req.user.id;

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId
      },
      include: {
        room: true
      },
      orderBy: {
        startTime: 'desc'
      }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: '获取预定记录失败' });
  }
});

// 取消预定
router.put('/bookings/:id/cancel', authenticateToken, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '未授权' });
  }

  const { id } = req.params;
  const userId = req.user.id;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) }
    });

    if (!booking || booking.userId !== userId) {
      return res.status(403).json({ error: '无权限取消该预定' });
    }

    const updateData: Prisma.BookingUpdateInput = {
      bookingStatus: 'cancelled'
    };

    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ error: '取消预定失败' });
  }
});

export default router; 