import express from 'express';
import cors from 'cors';
import certificateRoutes from './routes/certificates';

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

app.use('/api/certificates', certificateRoutes);

export default app;
