import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBookings() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        room: true,
        user: true
      }
    });

    console.log('数据库中的所有预订:', bookings);
  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBookings(); 