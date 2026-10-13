import 'dotenv/config';
import express from 'express';
const app = express();
app.disable('x-powered-by');
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'upec-api', phase: 'foundation-only' }));
const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`UPEC API foundation listening on ${port}`));
