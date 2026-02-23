// routes/hotelRoutes.js
const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const prisma = require('../utils/prisma');


// 定义具体的路由
router.get('/gethotellist', hotelController.getHotelList);
router.get('/gethotelinfo', hotelController.getHotelDetail);
router.put('/creathotelinfo', hotelController.saveHotelBasic);
router.put('/creathotelinfo/detail', hotelController.saveHotelDetails);
router.put('/creatrooms', hotelController.saveRoom);
router.post('/createreasons', hotelController.saveReason);
router.get('/getreasons', hotelController.getReasons);
router.post('/add', async (req, res) => {
    console.log('收到请求体:', req.body);
    try {
        const { hotelName, address, status } = req.body; // 从请求体拿数据

        // 在数据库中插入一行数据
        const newHotel = await prisma.hotel.create({
            data: {
                hotelName: hotelName,
                address: address,
                status: parseInt(status) || 0
            }
        });

        res.json({ code: 200, data: newHotel, msg: '酒店录入成功' });
    } catch (error) {
        res.status(500).json({ code: 500, msg: '录入失败', error: error.message });
    }
});
router.get('/detail/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const hotel = await prisma.hotel.findUnique({
            where: { id: id }
        });
        if (!hotel) return res.json({ code: 404, msg: '酒店不存在' });
        res.json({ code: 200, data: hotel });
    } catch (error) {
        res.status(500).json({ code: 500, msg: '查询失败' });
    }
});

module.exports = router;
