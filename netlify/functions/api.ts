import express from 'express';
import serverless from 'serverless-http';
import dotenv from 'dotenv';
import apiRouter from '../../src/api';

dotenv.config();

const app = express();
app.use(express.json());

// Support both /api/reframe and /reframe based on Netlify routing
app.use('/api', apiRouter);
app.use('/', apiRouter);

export const handler = serverless(app);
