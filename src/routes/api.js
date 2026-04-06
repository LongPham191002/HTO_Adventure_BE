const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// Đảm bảo dùng đúng: gameController.handleRequest
router.post('/submit', gameController.handleRequest);

module.exports = router;