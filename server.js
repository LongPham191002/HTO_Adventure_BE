require('dotenv').config();
const express = require('express');
const cors = require('cors');

// --- CHỐNG SẬP CHO MAC ---
process.on('uncaughtException', (err) => {
  console.error('❌ LỖI HỆ THỐNG:', err.message);
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kiểm tra xem file routes có tồn tại không trước khi nạp
try {
  const apiRoutes = require('./src/routes/api');
  app.use('/api/v1', apiRoutes);
} catch (e) {
  console.error("❌ Lỗi nạp Routes: Kiểm tra thư mục src/routes/api.js");
}

// Đổi hẳn sang cổng 8888 (Cổng này máy Mac ít khi chiếm dụng)
const PORT = 8888; 

// Thêm '0.0.0.0' để server chấp nhận kết nối từ bên ngoài (Nginx)
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('-------------------------------------------');
  console.log(`🚀 SERVER HITO ĐÃ KHÓA CỔNG: ${PORT}`);
  console.log(`📍 API: http://api-game.htogroup.com.vn/api/v1/submit`);
  console.log('-------------------------------------------');
});