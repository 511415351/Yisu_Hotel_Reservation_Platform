const express = require('express');
const router = express.Router();
const OSS = require('ali-oss');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// 1. 配置阿里云 OSS (注意：region 通常不加 .aliyuncs.com)
const client = new OSS({
    region: 'oss-cn-beijing', // 修改这里，只保留地域名
    accessKeyId: process.env.ALICLOUD_ACCESS_KEY_ID,
    accessKeySecret: process.env.ALICLOUD_ACCESS_KEY_SECRET,
    bucket: 'yisu-hotel-reservation'
});

// 2. 配置 Multer (存在内存里，直接转发给阿里云)
const upload = multer({ storage: multer.memoryStorage() });

// 3. 路由处理
router.post('/', upload.single('file'), async (req, res) => {
    console.log('--- 收到上传请求 ---');
    console.log('Headers:', req.headers['content-type']); // 看看是不是 multipart
    console.log('Body:', req.body); // 看看有没有非文件字段
    console.log('File:', req.file); // 看看文件是否为空
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ code: 400, msg: '请上传文件' });
        }

        // 生成云端文件名
        const fileName = `hotels/${uuidv4()}-${file.originalname}`;

        // 上传到 OSS
        const result = await client.put(fileName, file.buffer);

        // 返回 OSS 外网地址
        res.json({
            code: 200,
            data: {
                url: result.url // 阿里云返回的 https 链接
            },
            msg: '上传成功'
        });
    } catch (error) {
        console.error('OSS上传失败:', error);
        res.status(500).json({ code: 500, msg: '上传云端失败' });
    }
});

module.exports = router; // 必须导出路由
