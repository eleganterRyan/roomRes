import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateBookingDto } from '../dtos/booking.dto';
import { Request, Response } from 'express';

const prisma = new PrismaService();

export class BookingController {
  static async getBookings(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      const where: Prisma.BookingWhereInput = {
        startTime: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        }
      };

      const bookings = await prisma.booking.findMany({
        where,
        include: {
          room: true
        }
      });
      return res.json(bookings);
    } catch (error) {
      return res.status(500).json({ error: '获取预订失败' });
    }
  }

  static async createBooking(req: Request, res: Response) {
    try {
      const data: CreateBookingDto = req.body;
      const bookingData: Prisma.BookingCreateInput = {
        title: data.title,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        attendees: data.attendees,
        purpose: data.purpose,
        applicant: data.applicant,
        status: 'PENDING',
        room: {
          connect: { id: data.roomId }
        }
      };

      const booking = await prisma.booking.create({
        data: bookingData,
        include: {
          room: true
        }
      });
      return res.json(booking);
    } catch (error) {
      return res.status(500).json({ error: '创建预订失败' });
    }
  }

  static async cancelBooking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const booking = await prisma.booking.update({
        where: { id },
        data: {
          status: 'CANCELLED' as const
        }
      });
      return res.json(booking);
    } catch (error) {
      return res.status(500).json({ error: '取消预订失败' });
    }
  }

  static async getBooking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          room: true
        }
      });
      if (!booking) {
        return res.status(404).json({ error: '预订不存在' });
      }
      return res.json(booking);
    } catch (error) {
      return res.status(500).json({ error: '获取预订详情失败' });
    }
  }
} 