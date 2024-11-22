import { Request, Response } from 'express';
import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      res.status(401).json({ error: '用户名或密码错误' });
      return;
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: '用户名或密码错误' });
      return;
    }

    // 生成 JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // 返回用户信息和token
    res.json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        department: user.department,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '登录失败' });
  }
};

// 可选：添加其他认证相关的控制器函数
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, name, department } = req.body;

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      res.status(400).json({ error: '用户名已存在' });
      return;
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        department,
        role: 'USER'  // 默认角色
      }
    });

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        department: user.department,
        role: user.role
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '注册失败' });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  try {
    // 在这里处理登出逻辑，比如清除服务器端session等
    res.json({ message: '登出成功' });
  } catch (error) {
    console.error('登出失败:', error);
    res.status(500).json({ error: '登出失败' });
  }
}; 