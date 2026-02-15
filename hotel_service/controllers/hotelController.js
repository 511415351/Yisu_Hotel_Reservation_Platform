const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const prisma = require('../utils/prisma');

exports.getHotelList = async (req, res) => {
    // 这里可以处理数据库查询等逻辑
    console.log('收到请求体:', req.body);
    try {
        const hotels = await prisma.hotel.findMany();
        res.json({ code: 200, data: hotels, msg: '查询成功' });
    } catch (error) {
        res.status(500).json({ code: 500, msg: '查询失败' });
    }
};
exports.getHome = (req, res) => {
    res.send('Hello World from Controller');
};