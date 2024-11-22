import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import bookingRouter from './routes/booking';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// 路由
app.use('/api/auth', authRouter);
app.use('/api', bookingRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app; 