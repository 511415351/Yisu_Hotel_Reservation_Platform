// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL 
})

async function main() {
  console.log('🌱 正在清空旧数据...')
  // 注意：根据你的模型名修改，这里假设模型叫 hotel
  await prisma.hotel.deleteMany({})

  console.log('🚀 开始填充测试酒店...')
  await prisma.hotel.create({
    data: {
        id: 1,
        hotelName: '上海希尔顿酒店',
        address: '静安区华山路250号',
        status: 1
    }
  })
  console.log('✅ 填充成功！')
}

main()
  .catch((e) => {
    console.error('❌ 填充失败：', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })