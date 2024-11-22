import { Request, Response, NextFunction } from 'express';

export const validateRegistration = (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: '所有字段都是必填的' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: '密码长度至少为6位' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: '邮箱格式不正确' });
  }

  next();
}; 