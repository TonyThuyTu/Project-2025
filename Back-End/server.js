const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');
const routes = require('./routes/index.route');
const redisClient = require('./config/redisClient');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

//kết nối redis
redisClient.connect().catch(console.error);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - tiền tố /api cho toàn bộ
app.use('/api', routes);

// cho phép upload
app.use("/upload", express.static(path.join(__dirname, "upload")));

// Test route
app.get('/', (req, res) => {
  res.send('🚀 Welcome to my Apple API');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
