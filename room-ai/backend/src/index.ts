import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import roomRoutes from './routes/roomRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api', roomRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'RoomAI Backend Server' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 RoomAI Express Backend running on http://localhost:${PORT}`);
  });
}

export default app;
