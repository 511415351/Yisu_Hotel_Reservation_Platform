const express = require('express');
const router = express.Router();
const hotelController = require('./hotelController');
const prisma = require('../utils/prisma');

const getHotelList = async (req, res) => {
    try {
        const {
            location,
            keyword,
            stars,
            priceRange,
            hasParking,
            hasBreakfast
        } = req.query;
        console.log("收到的查询参数:", req.query);
        let whereClause = {
            status: 1 // 仅查询启用状态的酒店
        };
        if (location) {
            whereClause.address = {
                contains: location
            };
        }
        // --- 筛选：关键字 ---
        if (keyword) {
            whereClause.OR = [
                { hotelName: { contains: keyword } },
                { address: { contains: keyword } }
            ];
        }
        // --- 筛选：星级 ---
        if (stars) {
            const starNum = Number(stars);
            if (!isNaN(starNum)) {
                whereClause.stars = {
                    gte: starNum
                };
            }
        }
        if (priceRange && priceRange.includes('-')) {
            const [min, max] = priceRange.split('-').map(Number);
            whereClause.price = {
                gte: min,
                lte: max
            };
        }
        let requiredTags = [];
        if (hasParking === 'true') requiredTags.push("免费停车");
        if (hasBreakfast === 'true') requiredTags.push("含早餐");
        if (requiredTags.length > 0) {
            whereClause.tags = {
                hasEvery: requiredTags
            };
        }

        const hotels = await prisma.hotel.findMany({
            where: whereClause
        });

        const formattedData = hotels.map(hotel => {
            return {
                _id: hotel.id,
                hotelName: hotel.hotelName,
                status: hotel.status || 0,
                score: hotel.score,
                address: hotel.address,
                openingTime: hotel.openingTime,
                imageUrl: hotel.imageUrl || "",
                // --- 修复点：如果 tags 已经是字符串数组，直接返回即可 ---
                // --- 如果 tags 里面存的是对象，请先确保 tags 不为空 ---
                tags: Array.isArray(hotel.tags) ? hotel.tags : []
            };
        });
        res.status(200).json({
            code: 200,
            data: formattedData,
            msg: ""
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            code: 500,
            data: [],
            msg: "查询失败"
        });
    }
};
const getHotelDetail = async (req, res) => {
    try {
        // 从查询参数获取 hotelId
        const { hotelId } = req.query;

        if (!hotelId) {
            return res.status(400).json({
                code: 400,
                data: null,
                msg: "参数错误：缺少 hotelId"
            });
        }

        // 使用 Prisma 查询酒店，并包含关联的 rooms
        const hotel = await prisma.hotel.findFirst({
            where: {
                id: hotelId
            },
            include: {
                roomTypes: true // 这里的 'rooms' 必须对应你 prisma.schema 中定义的关联名称
            }
        });

        // 没找到酒店
        if (!hotel) {
            return res.status(404).json({
                code: 404,
                data: null,
                msg: "酒店不存在"
            });
        }

        // 2. 按照格式进行数据转换
        const formattedData = {
            _id: hotel.id,
            hotelId: hotel.businessId || hotel.id,
            hotelName: hotel.hotelName,
            //hotelierName: hotel.managerName || "管理员", 
            hotelierPhone: hotel.phone || "",
            hotelierEmail: hotel.email || "",
            hotelRoom: (hotel.roomTypes || []).map(room => ({
                id: room.id.toString(),
                roomName: room.name,
                roomPrice: room.price.toString(),
                number: room.capacity ? room.capacity.toString() : "0",
                hasTV: room.hasTV || false,
                hasWifi: room.hasWifi || false,
                hasWindow: room.hasWindow || false,
                hasBathtub: room.hasBathtub || false
            }))
        };

        // 3. 返回响应
        res.status(200).json({
            code: 200,
            data: formattedData,
            msg: ""
        });

    } catch (error) {
        console.error("获取详情失败:", error);
        res.status(500).json({
            code: 500,
            data: null,
            msg: "服务器内部错误"
        });
    }
};
const saveHotelBasic = async (req, res) => {
    console.log("Receive body:", req.body);
    if (!req.body) {
        return res.status(400).json({ code: 400, msg: "请求体为空，请检查是否配置了 express.json()" });
    }
    try {
        const { hoteliId, hotelName, hotelierName, hoteliEmail, hoteliAddress } = req.body;
        const { userId } = req.body;
        if (!userId) {
            return res.status(401).json({ code: 401, msg: "未获取到酒店负责人ID" });
        }
        // 如果没有 hoteliId，说明是全新的酒店，直接 create
        if (!hoteliId) {
            const newHotel = await prisma.hotel.create({
                data: {
                    hotelName: hotelName,
                    hotelierName: hotelierName,
                    hoteliEmail: hoteliEmail,
                    userId: parseInt(userId),
                    address: hoteliAddress,
                    openingTime: new Date().toISOString(), // 默认开业时间为当前时间
                    stars: 0,
                    score: 0.0,
                    status: 0
                }
            });
            return res.status(200).json({ code: 200, data: newHotel, msg: "新增成功" });
        }

        // 如果有 hoteliId，执行 upsert (有则写，无则增)
        const hotel = await prisma.hotel.upsert({
            where: { id: hoteliId },
            update: {
                hotelName,
                hotelierName: hotelierName,
                hoteliEmail: hoteliEmail,
                address: hoteliAddress
            },
            create: {
                id: hoteliId, // 如果是自己指定ID
                hotelName,
                hotelierName: hotelierName,
                hoteliEmail: hoteliEmail,
                address: hoteliAddress,
                userId: parseInt(userId),
                openingTime: new Date().toISOString(), // 默认开业时间为当前时间
                stars: 0,
                score: 0.0,
                status: 0
            }
        });

        res.status(200).json({ code: 200, data: hotel, msg: "保存成功" });
    } catch (error) {
        res.status(500).json({ code: 500, msg: error.message });
    }
};

const saveHotelDetails = async (req, res) => {
    try {
        const { hotelId, hasBreakfast, hasParking, location, nearby, openingTime, picture, stars } = req.body;
        const tagsAction = {
            connectOrCreate: [],
            disconnect: []
        };
        if (hasBreakfast) {
            tagsAction.connectOrCreate.push({
                where: { name: "含早餐" },
                create: { name: "含早餐" }
            });
        }
        else {
            tagsAction.disconnect.push({ name: "含早餐" });
        }
        if (hasParking) {
            tagsAction.connectOrCreate.push({
                where: { name: "免费停车" },
                create: { name: "免费停车" }
            });
        }
        else {
            tagsAction.disconnect.push({ name: "免费停车" });
        }
        const hotel = await prisma.hotel.update({
            where: { id: hotelId },
            data: {
                address: location,
                nearby: nearby || null,
                openingTime: openingTime,
                imageUrl: picture,
                stars: stars,
                tags: tagsAction
            },
            include: {
                tags: true
            }
        });

        res.status(200).json({ code: 200, data: hotel, msg: "保存成功" });
    } catch (error) {
        res.status(500).json({ code: 500, msg: error.message });
    }
};

const saveRoom = async (req, res) => {
    try {
        const {
            roomId, // 注意：建议前端在修改时传这个房间的唯一ID
            hoteliID,
            roomName,
            roomPrice,
            capacity,
            roomPicture,
            bedType,
            bedCount,
            hasTV,
            hasWifi,
            hasWindow,
            hasBathtub
        } = req.body;

        // 情况 A: 修改现有房间 (通过 roomId)
        if (roomId) {
            const updatedRoom = await prisma.roomType.update({
                where: { id: roomId },
                data: {
                    name: roomName,
                    price: parseFloat(roomPrice),
                    capacity: parseInt(capacity),
                    imageUrl: roomPicture,
                    bedType: bedType || "默认床型",
                    bedCount: parseInt(bedCount),
                    hasTV: !!hasTV,
                    hasWifi: !!hasWifi,
                    hasWindow: !!hasWindow,
                    hasBathtub: !!hasBathtub
                }
            });
            return res.status(200).json({ code: 200, data: updatedRoom, msg: "房间修改成功" });
        }

        // 情况 B: 新增房间 (到指定酒店下)
        const newRoom = await prisma.roomType.create({
            data: {
                hotelId: hoteliID,
                name: roomName,
                price: parseFloat(roomPrice),
                capacity: parseInt(capacity),
                imageUrl: roomPicture,
                bedType: bedType || "默认床型",
                bedCount: parseInt(bedCount),
                hasTV: !!hasTV,
                hasWifi: !!hasWifi,
                hasWindow: !!hasWindow,
                hasBathtub: !!hasBathtub
            }
        });

        res.status(200).json({ code: 200, data: newRoom, msg: "房间新增成功" });

    } catch (error) {
        res.status(500).json({ code: 500, msg: "操作失败: " + error.message });
    }
};

// 导出
module.exports = {
    getHotelList,
    getHotelDetail,
    saveHotelBasic,
    saveHotelDetails,
    saveRoom
};
