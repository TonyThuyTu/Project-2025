const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/sequelize');
const routes = require('./routes/index.route');
const redisClient = require('./config/redisClient');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('✅ Kết nối MySQL qua Sequelize thành công!');
    // Khởi động server nếu kết nối thành công
    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Kết nối MySQL thất bại:', err);
});

//kết nối redis
redisClient.connect().catch(console.error);

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // nếu FE có gửi cookie hoặc token qua header
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - tiền tố /api cho toàn bộ
app.use('/api', routes);

// cho phép upload
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test route
app.get('/', (req, res) => {
  res.send('🚀 Welcome to my AppleStore API');
});

// Start server
// app.listen(PORT, () => {
//   console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
// });
