import { Module } from '@nestjs/common';
import { BookingService } from './services/booking.service';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    BookingService,
    PrismaService
  ],
})
export class AppModule {} 