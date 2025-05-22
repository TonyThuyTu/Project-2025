const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const db = require('./config/db');
const routes = require('./routes/index.route');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - tiền tố /api cho toàn bộ
app.use('/api', routes);

// Test route
app.get('/', (req, res) => {
  res.send('🚀 Welcome to Apple Store API');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
