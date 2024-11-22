import { Router } from 'express';
import { register, login, getCurrentUser } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRegistration } from '../middleware/validate.middleware';

const router = Router();

router.post('/register', validateRegistration, register);
router.post('/login', login);
router.get('/me', authMiddleware, getCurrentUser);

export { router as userRouter }; 