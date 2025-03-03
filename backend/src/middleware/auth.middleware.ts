import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 修改 JwtPayload 接口，使其与 token 中的数据一致
interface JwtPayload {
  userId: string;
  username: string;
  role: UserRole;
}

// 声明 Express 的 Request 类型扩展
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        username: string;
        name: string;
        role: UserRole;
      }
    }
  }
}

async function getUserFromToken(decoded: JwtPayload) {
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      department: true
    }
  });
  return user;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    // 添加调试日志
    console.log('收到的 token:', token);
    
    if (!token) {
      res.status(401).json({ message: '未提供认证令牌' });
      return;
    }

    // 确保 JWT_SECRET 存在
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not found in environment variables');
      res.status(500).json({ message: '服务器配置错误' });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
      console.log('解码后的 token:', decoded);  // 添加调试日志
      
      const user = await getUserFromToken(decoded);
      if (!user) {
        res.status(401).json({ message: '用户不存在' });
        return;
      }

      req.user = {
        userId: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      };
      
      next();
    } catch (jwtError) {
      console.error('JWT 验证失败:', jwtError);
      res.status(401).json({ message: '无效的认证令牌' });
      return;
    }
  } catch (error) {
    console.error('认证中间件错误:', error);
    res.status(401).json({ message: '认证失败' });
    return;
  }
}; 