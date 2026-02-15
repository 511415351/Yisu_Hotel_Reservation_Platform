# 1. 使用 Node 镜像
FROM node:18-alpine

# 2. 设置工作目录
WORKDIR /app

# 3. 先复制 package.json 并安装依赖（利用 Docker 缓存）
COPY package*.json ./
RUN npm install

# 4. 复制 Prisma 的 schema 并生成代码
COPY prisma ./prisma/
RUN npx prisma generate

# 5. 复制所有代码到容器
COPY . .

# 6. 暴露你 Express 运行的端口
EXPOSE 3000

# 7. 启动命令（启动前可以跑一下 push 确保数据库结构同步）
CMD npx prisma db push && npm start
