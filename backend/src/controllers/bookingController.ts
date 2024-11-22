import { Controller, Post, Body, Get, Query, Param, Delete } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateBookingDto } from '../dtos/booking.dto';

@Controller('bookings')
export class BookingController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getBookings(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const where: Prisma.BookingWhereInput = {
      startTime: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    };

    return this.prisma.booking.findMany({
      where,
      include: {
        room: true
      }
    });
  }

  @Post()
  async createBooking(@Body() data: CreateBookingDto) {
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

  @Delete(':id')
  async cancelBooking(@Param('id') id: string) {
    return this.prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED' as const
      }
    });
  }
} 