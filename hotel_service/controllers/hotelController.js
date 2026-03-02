const express = require('express');
const router = express.Router();
const hotelController = require('./hotelController');
const prisma = require('../utils/prisma');

const getHotelList = async (req, res) => {
    try {
        const {
            userId,
            location,
            keyword,
            stars,
            score,
            priceRange,
            hasParking,
            hasBreakfast
        } = req.query;
        console.log("收到的查询参数:", req.query);
        let whereClause = {};
        if (userId) {
            const parsedUserId = parseInt(userId);
            const requestingUser = await prisma.user.findUnique({
                where: { id: parsedUserId }
            });
            // 如果是普通用户，只能看自己的酒店
            if (requestingUser && requestingUser.role !== 'admin') {
                whereClause.userId = parsedUserId; // 必须是整数
            }
            // 如果是 admin，whereClause 保持为空对象，代表查询所有
        } else {
            // 如果没传 userId，只查已启用的
            whereClause.status = 1;
        }

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
        if (score) {
            const scoreNum = Number(score);
            if (!isNaN(scoreNum)) {
                whereClause.score = {
                    gte: scoreNum
                };
            }
        }
        if (priceRange && priceRange.includes('-')) {
            const [min, max] = priceRange.split('-').map(Number);
            whereClause.roomTypes = {
                some: {
                    price: {
                        gte: min,
                        lte: max
                    }
                }
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
            where: whereClause,
            include: {
                roomTypes: true,
                tags: true
            }
        });

        const formattedData = hotels.map(hotel => {
            const prices = hotel.roomTypes.map(room => room.price);
            const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;
            return {
                userId: hotel.userId,
                _id: hotel.id,
                hotelName: hotel.hotelName,
                status: hotel.status || 0,
                score: hotel.score,
                address: hotel.address,
                openingTime: hotel.openingTime,
                imageUrl: hotel.imageUrl || "",
                // --- 修复点：如果 tags 已经是字符串数组，直接返回即可 ---
                // --- 如果 tags 里面存的是对象，请先确保 tags 不为空 ---
                tags: Array.isArray(hotel.tags) ? hotel.tags : [],
                lowestPrice: lowestPrice
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
            openingTime: hotel.openingTime,
            address: hotel.address,
            stars: hotel.stars,
            score: hotel.score,
            imageUrl: hotel.imageUrl || "",
            hasBreakfast: hotel.tags ? hotel.tags.includes("含早餐") : false,
            hasParking: hotel.tags ? hotel.tags.includes("免费停车") : false,
            nearby: hotel.nearby || "",
            hotelRoom: (hotel.roomTypes || []).map(room => ({
                id: room.id.toString(),
                hotelId: hotel.id.toString(),
                roomName: room.name,
                roomPrice: room.price.toString(),
                number: room.capacity ? room.capacity.toString() : "0",
                imageUrl: room.imageUrl || "",
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
    console.log("saveReceive body:", req.body);
    if (!req.body) {
        return res.status(400).json({ code: 400, msg: "请求体为空，请检查是否配置了 express.json()" });
    }

    try {
        const {
            hotelId, hotelName, hotelierName, hotelierEmail, address,
            nearby, openingTime, imageUrl, status, score, stars,
            hasBreakfast, hasParking, userId
        } = req.body;

        if (!userId) {
            return res.status(401).json({ code: 401, msg: "未获取到酒店负责人ID" });
        }

        // --- 1. 权限校验逻辑 ---
        let canChangeStatus = false;
        if (status !== undefined || score !== undefined) {
            const requestingUser = await prisma.user.findUnique({
                where: { id: parseInt(userId) }
            });
            if (requestingUser && requestingUser.role === 'admin') {
                canChangeStatus = true;
            } else if (status !== undefined || score !== undefined) {
                return res.status(403).json({ code: 403, msg: "只有管理员有权修改状态或评分" });
            }
        }

        // --- 2. 构造基础数据对象 ---
        const updateData = {};
        if (hotelName !== undefined) updateData.hotelName = hotelName;
        if (hotelierName !== undefined) updateData.hotelierName = hotelierName;
        if (hotelierEmail !== undefined) updateData.hoteliEmail = hotelierEmail;
        if (address !== undefined) updateData.address = address;
        if (nearby !== undefined) updateData.nearby = nearby;
        if (openingTime !== undefined) updateData.openingTime = openingTime;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (stars !== undefined) updateData.stars = parseInt(stars);

        if (canChangeStatus) {
            if (status !== undefined) updateData.status = parseInt(status);
            if (score !== undefined) updateData.score = parseFloat(score);
        } else if (!hotelId) {
            updateData.status = 0; // 新增酒店时，非管理员默认为待审核
        }

        // --- 3. 处理标签逻辑 (核心修复点) ---
        // 先定义哪些标签是选中的
        const selectedTagNames = [];
        if (hasBreakfast) selectedTagNames.push("含早餐");
        if (hasParking) selectedTagNames.push("免费停车");

        const connectOrCreate = selectedTagNames.map(name => ({
            where: { name: name },
            create: { name: name }
        }));

        // 如果没有 hotelId，执行 CREATE
        if (!hotelId) {
            if (!hotelName || !address) {
                return res.status(400).json({ code: 400, msg: "新增酒店时，酒店名称和地址不能为空" });
            }

            const newHotel = await prisma.hotel.create({
                data: {
                    ...updateData,
                    userId: parseInt(userId),
                    score: updateData.score || 0.0,
                    // 【修复】新建时只传 connectOrCreate
                    tags: {
                        connectOrCreate: connectOrCreate
                    }
                }
            });
            return res.status(200).json({ code: 200, data: newHotel, msg: "新增成功" });
        }

        // --- 4. 修改逻辑 (UPDATE) ---
        const existingHotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
        if (!existingHotel) {
            return res.status(404).json({ code: 404, msg: "找不到对应的酒店ID" });
        }

        // 在更新时，我们需要处理标签的“勾选”与“取消勾选”
        // 这里的技巧是：先 disconnect 所有可能被取消的标签
        const allPossibleTags = ["含早餐", "免费停车"];
        const disconnect = allPossibleTags
            .filter(name => !selectedTagNames.includes(name))
            .map(name => ({ name: name }));

        const updatedHotel = await prisma.hotel.update({
            where: { id: hotelId },
            data: {
                ...updateData,
                tags: {
                    connectOrCreate: connectOrCreate,
                    disconnect: disconnect // 更新时可以使用 disconnect
                }
            }
        });

        res.status(200).json({ code: 200, data: updatedHotel, msg: "保存成功" });

    } catch (error) {
        console.log("保存酒店基本信息失败:", error);
        res.status(500).json({ code: 500, msg: error.message });
    }
};


const saveHotelDetails = async (req, res) => {
    console.log("saveHotelDetails body:", req.body);
    if (!req.body) {
        return res.status(400).json({ code: 400, msg: "请求体为空，请检查是否配置了 express.json()" });
    }
    try {
        const { hotelId, hasBreakfast, hasParking, address, nearby, openingTime, imageUrl, stars } = req.body;
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
                address: address,
                nearby: nearby || null,
                openingTime: openingTime,
                imageUrl: imageUrl,
                stars: parseInt(stars),
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
            id, // 注意：建议前端在修改时传这个房间的唯一ID
            hotelId,
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
        console.log("Received room data:", req.body);
        // 情况 A: 修改现有房间 (通过 roomId)
        if (id) {
            const updatedRoom = await prisma.roomType.update({
                where: { id: id },
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
        if (!hotelId) {
            return res.status(400).json({ code: 400, msg: "新增房间必须提供 hotelId" });
        }
        // 情况 B: 新增房间 (到指定酒店下)
        const newRoom = await prisma.roomType.create({
            data: {
                hotelId: hotelId,
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

const saveReason = async (req, res) => {
    try {
        const { hotelId, reason } = req.body;
        console.log("Received reason data:", req.body);
        if (!hotelId || !reason) {
            return res.status(400).json({ code: 400, msg: "参数错误：hotelId 和 reason 都不能为空" });
        }
        const newReason = await prisma.hotel.update({
            where: { id: hotelId },
            data: {
                reason: reason
            }
        });
        res.status(200).json({ code: 200, data: newReason, msg: "理由添加成功" });
    } catch (error) {
        res.status(500).json({ code: 500, msg: "添加理由失败: " + error.message });
    }
};

const getReasons = async (req, res) => {
    try {
        const { hotelId } = req.query;
        const reasons = await prisma.hotel.findMany({
            where: { id: hotelId },
            select: {
                reason: true
            }
        });
        res.status(200).json({ code: 200, data: reasons, msg: "" });
    } catch (error) {
        res.status(500).json({ code: 500, msg: "查询理由失败: " + error.message });
    }
};
// 导出
module.exports = {
    getHotelList,
    getHotelDetail,
    saveHotelBasic,
    saveHotelDetails,
    saveRoom,
    saveReason,
    getReasons
};
