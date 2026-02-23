const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 秘钥（正式项目应放在 .env 文件中）
const JWT_SECRET = 'your_jwt_secret_key_123';

// --- 注册逻辑 ---
exports.register = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // 1. 检查用户是否已存在
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ code: 400, msg: '用户名已被占用' });
        }

        // 2. 密码加密（加盐哈希）
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. 存入数据库
        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role: role || 'user'
            }
        });

        res.json({ code: 200, msg: '注册成功', data: { username: newUser.username } });
    } catch (error) {
        res.status(500).json({ code: 500, msg: '注册失败', error: error.message });
    }
};

// --- 登录逻辑 ---
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. 查找用户
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            return res.status(400).json({ code: 400, msg: '用户不存在' });
        }

        // 2. 验证密码
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ code: 400, msg: '密码错误' });
        }

        // 3. 生成 JWT Token (有效期 24 小时)
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 4. 返回用户信息和 Token
        res.json({
            code: 200,
            msg: '登录成功',
            data: {
                token,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ code: 500, msg: '登录异常', error: error.message });
    }
};