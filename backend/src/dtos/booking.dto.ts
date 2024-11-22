import { IsString, IsNumber, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class CreateBookingDto {
  @IsString()
  roomId: string;

  @IsString()
  title: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsNumber()
  attendees: number;

  @IsString()
  @IsOptional()
  purpose?: string;

  @IsString()
  applicant: string;

  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;
} 