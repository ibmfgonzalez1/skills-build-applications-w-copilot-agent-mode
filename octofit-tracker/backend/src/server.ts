import express from 'express';
import './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js';

const app = express();
const port = Number(process.env.PORT ?? 8000);
const codespaceName = process.env.CODESPACE_NAME;
const apiBaseUrl = codespaceName
  ? `https://${codespaceName}-8000.app.github.dev`
  : 'http://localhost:8000';

app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.use('/api', apiRoutes);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`OctoFit API listening on port ${port}`);
  console.log(`OctoFit API base URL: ${apiBaseUrl}`);
});