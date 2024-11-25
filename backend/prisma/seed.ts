import { PrismaClient, UserRole, RoomStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 创建默认管理员用户
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      name: '管理员',
      password: 'admin123', // 实际应用中应该加密
      department: 'IT部门',
      role: UserRole.ADMIN
    }
  });

  console.log('Created admin user:', adminUser);

  // 添加会议室数据
  const rooms = [
    {
      name: '木星会议室',
      capacity: 20,
      facilities: ['投影仪', '白板', '视频会议系统', 'WiFi'],
      location: '主楼',
      floor: 1,
      building: 'A栋',
      description: '大型会议室，适合部门会议和培训',
      roomStatus: RoomStatus.AVAILABLE,
    },
    {
      name: '火星会议室',
      capacity: 12,
      facilities: ['电视屏幕', '白板', 'WiFi'],
      location: '主楼',
      floor: 1,
      building: 'A栋',
      description: '中型会议室，适合团队讨论',
      roomStatus: RoomStatus.AVAILABLE,
    },
    {
      name: '金星会议室',
      capacity: 8,
      facilities: ['电视屏幕', '白板', 'WiFi'],
      location: '主楼',
      floor: 2,
      building: 'A栋',
      description: '小型会议室，适合小组会议',
      roomStatus: RoomStatus.AVAILABLE,
    },
    {
      name: '水星会议室',
      capacity: 6,
      facilities: ['电视屏幕', 'WiFi'],
      location: '主楼',
      floor: 2,
      building: 'A栋',
      description: '小型会议室，适合面试和小组讨论',
      roomStatus: RoomStatus.AVAILABLE,
    },
    {
      name: '天王星会议室',
      capacity: 16,
      facilities: ['投影仪', '白板', '视频会议系统', 'WiFi'],
      location: '副楼',
      floor: 1,
      building: 'B栋',
      description: '中型会议室，配备完整视频会议设施',
      roomStatus: RoomStatus.AVAILABLE,
    },
    {
      name: '海王星会议室',
      capacity: 10,
      facilities: ['电视屏幕', '白板', 'WiFi'],
      location: '副楼',
      floor: 1,
      building: 'B栋',
      description: '中型会议室，适合项目会议',
      roomStatus: RoomStatus.AVAILABLE,
    },
    {
      name: '冥王星会议室',
      capacity: 4,
      facilities: ['电视屏幕', 'WiFi'],
      location: '副楼',
      floor: 2,
      building: 'B栋',
      description: '小型洽谈室，适合简短会议',
      roomStatus: RoomStatus.AVAILABLE,
    },
    {
      name: '地球会议室',
      capacity: 30,
      facilities: ['投影仪', '音响系统', '视频会议系统', 'WiFi', '演讲台'],
      location: '主楼',
      floor: 1,
      building: 'A栋',
      description: '大型会议室，适合举办大型会议和演讲',
      roomStatus: RoomStatus.AVAILABLE,
    },
    {
      name: '土星会议室',
      capacity: 15,
      facilities: ['投影仪', '白板', 'WiFi', '视频会议系统'],
      location: '副楼',
      floor: 2,
      building: 'B栋',
      description: '中型会议室，适合部门例会',
      roomStatus: RoomStatus.AVAILABLE,
    },
    {
      name: '月球会议室',
      capacity: 8,
      facilities: ['电视屏幕', '白板', 'WiFi'],
      location: '主楼',
      floor: 3,
      building: 'A栋',
      description: '小型会议室，安静舒适',
      roomStatus: RoomStatus.AVAILABLE,
    },
  ];

  // 创建会议室
  for (const room of rooms) {
    await prisma.room.create({
      data: room,
    });
  }

  console.log('已成功创建会议室数据');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 