import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { BookingStatus, RoomStatus } from '@prisma/client';
import { CreateBookingDto } from '../dtos/booking.dto';  // 导入 DTO
import { validate } from 'class-validator';  // 导入验证器
import jwt from 'jsonwebtoken';
import { NextFunction } from 'express';

// 获取会议室列表
export const getRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    // 添加日志
    console.log('开始获取会议室列表');
    
    const rooms = await prisma.room.findMany({
      where: {
        roomStatus: RoomStatus.AVAILABLE
      },
      include: {
        bookings: {
          where: {
            status: {
              in: [BookingStatus.APPROVED, BookingStatus.PENDING]
            },
            startTime: {
              gte: new Date()
            }
          }
        }
      }
    });

    // 添加日志
    console.log('成功获取会议室列表:', rooms.length);
    
    res.json(rooms);
  } catch (error) {
    // 详细的错误日志
    console.error('获取会议室失败:', error);
    res.status(500).json({ 
      error: '获取会议室失败',
      details: error instanceof Error ? error.message : '未知错误'
    });
  }
};

// 创建预订
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    // 添加调试日志
    console.log('收到的预订数据:', req.body);
    
    // 创建 DTO 实例并验证
    const bookingDto = new CreateBookingDto();
    Object.assign(bookingDto, req.body);

    // 验证 DTO
    const errors = await validate(bookingDto);
    if (errors.length > 0) {
      console.log('验证错误:', errors); // 添加验证错误日志
      res.status(400).json({ 
        error: '无效的请求数据',
        details: errors.map(error => ({
          property: error.property,
          constraints: error.constraints
        }))
      });
      return;
    }

    const { roomId, title, startTime, endTime, attendees, purpose } = bookingDto;
    
    // 添加调试日志
    console.log('原始时间数据:', { startTime, endTime });
    
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);
    
    console.log('转换后的时间:', {
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString()
    });

    // 从请求中获取当前登录用户信息
    const currentUser = req.user;

    if (!currentUser) {
      res.status(401).json({ error: '请先登录' });
      return;
    }

    // 验证结束时间是否晚于开始时间
    if (endDateTime <= startDateTime) {
      res.status(400).json({ error: '结束时间必须晚于开始时间' });
      return;
    }

    // 检查时间冲突
    const conflicts = await prisma.booking.findMany({
      where: {
        roomId,
        status: BookingStatus.APPROVED,
        startTime: { lt: endDateTime },
        endTime: { gt: startDateTime }
      }
    });

    // 添加调试日志
    console.log('查询到的冲突:', conflicts);
    
    if (conflicts.length > 0) {
      const conflictDetails = conflicts.map(booking => ({
        id: booking.id,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status
      }));
      
      res.status(400).json({ 
        error: '该时间段已被预订',
        conflicts: conflictDetails
      });
      return;
    }

    // 创建预订
    const booking = await prisma.booking.create({
      data: {
        title,
        startTime: startDateTime,
        endTime: endDateTime,
        attendees: attendees || 1,
        purpose,
        applicant: currentUser.name,
        status: BookingStatus.APPROVED,
        roomId,  // 直接使用 roomId
        userId: currentUser.userId  // 直接使用 userId
      },
      include: {
        room: true
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
          { endTime: { lte: new Date(endDate as string) } },
          { status: { not: BookingStatus.CANCELLED } }
        ]
      },
      include: {
        room: true,
        user: {
          select: {
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
    const { id } = req.params;
    console.log('收到取消预订请求，ID:', id); // 添加日志
    
    if (!id) {
      console.log('预订ID为空');
      res.status(400).json({ error: '预订ID不能为空' });
      return;
    }

    const currentUser = req.user;
    if (!currentUser) {
      console.log('用户未登录');
      res.status(401).json({ error: '请先登录' });
      return;
    }

    console.log('正在查找预订记录...');
    const booking = await prisma.booking.findFirst({  // 改用 findFirst
      where: { 
        id: id
      }
    });

    console.log('查找结果:', booking);

    if (!booking) {
      console.log('未找到预订记录');
      res.status(404).json({ error: '预订不存在' });
      return;
    }

    // 检查是否是预订人
    if (booking.applicant !== currentUser.name) {
      res.status(403).json({ error: '只有预订人可以取消预订' });
      return;
    }

    // 更新预订状态
    console.log('正在更新预订状态...');
    const updatedBooking = await prisma.booking.update({
      where: { id: id },
      data: { 
        status: BookingStatus.CANCELLED 
      }
    });

    console.log('预订已取消:', updatedBooking);
    res.json(updatedBooking);
  } catch (error) {
    console.error('取消预订时发生错误:', error);
    res.status(500).json({ 
      error: '取消预订失败',
      details: error instanceof Error ? error.message : '未知错误'
    });
  }
};

// 添加新的测试接口
export const checkTimeSlot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomId, startTime, endTime } = req.query;
    
    if (!roomId || !startTime || !endTime) {
      res.status(400).json({ error: '缺少必要参数' });
      return;
    }

    const startDateTime = new Date(startTime as string);
    const endDateTime = new Date(endTime as string);

    // 查询所有相关预订
    const bookings = await prisma.booking.findMany({
      where: {
        roomId: roomId as string,
        status: BookingStatus.APPROVED,
        OR: [
          {
            startTime: {
              gte: startDateTime,
              lt: endDateTime
            }
          },
          {
            endTime: {
              gt: startDateTime,
              lte: endDateTime
            }
          }
        ]
      }
    });

    res.json({
      requestedTimeSlot: {
        start: startDateTime,
        end: endDateTime
      },
      existingBookings: bookings
    });
  } catch (error) {
    console.error('检查时间段失败:', error);
    res.status(500).json({ error: '检查时间段失败' });
  }
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: '未提供认证令牌' });
      return;
    }

    const token = authHeader.split(' ')[1];  // 获取 Bearer token
    if (!token) {
      res.status(401).json({ error: '无效的认证格式' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // 设置用户信息到请求对象
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      name: decoded.name,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('认证失败:', error);
    res.status(401).json({ error: '无效的认证令牌' });
  }
}; 