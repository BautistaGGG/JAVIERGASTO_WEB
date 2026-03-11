import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './initDatabase.js';
import adminRoutes from './routes/admin.js';
import contactRoutes from './routes/contacts.js';
import productRoutes from './routes/products.js';
import taxonomyRoutes from './routes/taxonomy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const distPath = path.join(__dirname, '..', 'dist');

initDatabase();

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(express.json({ limit: '5mb' }));

app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api', taxonomyRoutes);

app.use(express.static(distPath));
app.get('*', (req, res) => {
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint no encontrado' });
  }
  return res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}/api`);
});
