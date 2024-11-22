import { PrismaClient, UserRole } from '@prisma/client';

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 