const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createHotelTags() {
  try {
    const tags = [
      { id: 1, name: "免费停车", description: "提供免费停车场服务" },
      { id: 2, name: "含早餐", description: "包含早餐服务" },
      { id: 3, name: "免费WiFi", description: "提供免费WiFi网络服务" },
      { id: 4, name: "健身房", description: "提供健身房设施" },
      { id: 5, name: "游泳池", description: "提供游泳池设施" },
      { id: 6, name: "亲子友好", description: "适合家庭入住，提供儿童设施" }
    ];

    for (const tag of tags) {
      await prisma.hotelTag.upsert({
        where: { id: tag.id },
        update: tag,
        create: tag
      });
    }

    console.log("✅ 酒店标签创建成功！");
  } catch (error) {
    console.error("❌ 酒店标签创建失败：", error);
  }
}