import express from 'express';
import cors from 'cors';
import otpRoutes from './routes/otp';
import visitRoutes from './routes/visits';
import scanRoutes from './routes/scan';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/scan', scanRoutes);

app.listen(4000, '0.0.0.0', () => console.log('Server on http://0.0.0.0:4000'));
