import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from '../dtos/booking.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async createBooking(data: CreateBookingDto) {
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

    return this.prisma.booking.create({
      data: bookingData,
      include: {
        room: true
      }
    });
  }

  // 其他方法...
} 