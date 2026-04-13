import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db';
import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/job.routes';
import candidateRoutes from './routes/candidate.routes';
import screeningRoutes from './routes/screening.routes';
import analyticsRoutes from './routes/analytics.routes';
import comparisonRoutes from './routes/comparison.routes';
import applicationRoutes from './routes/application.routes';
import interviewRoutes from './routes/interview.routes';
import reviewRoutes from './routes/review.routes';
import companyRoutes from './routes/company.routes';
import departmentRoutes from './routes/department.routes';
import notificationRoutes from './routes/notification.routes';
import skillRoutes from './routes/skill.routes';
import messageRoutes from './routes/message.routes';
import auditlogRoutes from './routes/auditlog.routes';
import settingsRoutes from './routes/settings.routes';
import subscriptionRoutes from './routes/subscription.routes';
import { setupSwagger } from './config/swagger';

dotenv.config();

const app = express();

// Swagger Documentation
setupSwagger(app);

// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/screening', screeningRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/comparison', comparisonRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/audit-logs', auditlogRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Umurava Screening AI API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
