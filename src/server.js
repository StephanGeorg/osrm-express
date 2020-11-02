import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import boolParser from 'express-query-boolean';
import morgan from 'morgan';
import config from 'config';

import { authenticate } from './api/middleware/auth/auth';
import error from './api/middleware/error/error';
import boot from './api/boot/boot';

import { logger } from './utils/logs/logs';

import routes from './api/routes';

const app = express();
const port = process.env.PORT || 1985;
const startTime = new Date();

// Logging all requests
app.use(morgan('combined', { stream: logger.stream }));

app.use(authenticate); // Authenticate request
app.use(cors()); // Enable CORS headers
app.use(bodyParser.json());
app.use(boolParser());

// Routes
app.use(`${config.get('api.prefix')}/`, routes);

// Error handler
app.use(error);

const server = app.listen(port, () => {
  // Run task after boot
  boot(server, startTime);
});

export default app;
