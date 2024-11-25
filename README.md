# 会议室预订系统

一个现代化的会议室预订管理系统，支持会议室查看、预订、管理等功能。

## 项目结构 
F:\mine\cursorProject\roomReservation\backend
├── node_modules
├── package-lock.json
├── package.json
├── prisma
├── src
└── tsconfig.json

F:\mine\cursorProject\roomReservation\frontend
├── eslint.config.js
├── index.html
├── node_modules
├── package-lock.json
├── package.json
├── postcss.config.js
├── public
├── README.md
├── src
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts

## 技术栈

### 前端
- React
- TypeScript
- TailwindCSS
- Dayjs
- Axios

### 后端
- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL

## 功能特性

- 📅 可视化会议室预订日历
- 🏢 多会议室管理
- 📊 实时预订状态显示
- 👥 用户权限管理
- 📝 预订申请和审批流程
- 🔍 会议室详细信息查看

## 快速开始

### 环境要求
- Node.js >= 14
- PostgreSQL >= 12
- npm 或 yarn

### 安装步骤

1. 克隆项目
   bash
git clone [项目地址]

2. 安装后端依赖
   bash
cd backend
npm install

3. 配置环境变量
   bash
cp .env.example .env
编辑 .env 文件，配置数据库连接等信息

4. 初始化数据库
 bash
npx prisma migrate dev
npm run seed

5. 启动后端
   bash
npm run dev

6. 启动前端
   bash
cd frontend
npm run dev

7. 启动前端服务
   bash
npm run dev


## 开发指南

### 数据库迁移
bash
cd backend
npx prisma migrate dev

### 生成 Prisma Client
bash
npx prisma generate

### 运行测试
bash
npm test


## API 文档

主要 API 端点：

- `GET /api/rooms` - 获取所有会议室
- `GET /api/rooms/bookings` - 获取会议室预订情况
- `POST /api/bookings` - 创建新预订
- `GET /api/bookings` - 获取预订列表
- `DELETE /api/bookings/:id` - 取消预订

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

[MIT License](LICENSE)

## 联系方式

如有问题或建议，请提交 Issue 或 Pull Request。


## 后续待开发功能
1. 会议室取消功能
2. 会议室审批功能
3. 会议预约浮动窗口时间轴优化（标红已预约时间段）
4. 各基层单位会议室集成至本系统
5. 在会议室日历界面添加筛选功能，如按会议室规模、设施、位置等
6. 创建面向学院师生开放的查看界面





