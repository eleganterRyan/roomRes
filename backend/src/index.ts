import express from 'express';
import cors from 'cors';
import { getRooms, getRoomBookings, createBooking, cancelBooking, checkTimeSlot } from './controllers/roomController';
import { login } from './controllers/auth.controller';
import { authMiddleware } from './middleware/auth.middleware';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/rooms', getRooms);
app.get('/api/bookings', getRoomBookings);
app.post('/api/bookings', authMiddleware, createBooking);
app.delete('/api/bookings/:id', authMiddleware, cancelBooking);
app.post('/api/auth/login', login);
app.get('/api/check-time-slot', checkTimeSlot);

const PORT = process.env.PORT || 3000;

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  } else {
    console.error('Server error:', error);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app;