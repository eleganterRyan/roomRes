import express from 'express';
import cors from 'cors';
import { BookingController } from './controllers/bookingController';
import { getRooms, getRoomBookings } from './controllers/roomController';
import { login } from './controllers/auth.controller';

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/rooms', getRooms);
app.get('/api/rooms/bookings', getRoomBookings);
app.post('/api/bookings', BookingController.createBooking);
app.get('/api/bookings', BookingController.getBookings);
app.delete('/api/bookings/:id', ookingController.cancelBooking);
app.get('/api/bookings/:id', BookingController.getBooking);
app.post('/api/auth/login', login);

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