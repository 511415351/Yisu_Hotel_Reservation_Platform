// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL 
})
async function createHotelTags() {
  try {
    const tags = [
    { name: "免费停车", icon: "parking-icon" },
    { name: "含早餐", icon: "breakfast-icon" },
    { name: "健身房", icon: "gym-icon" },
    { name: "游泳池", icon: "pool-icon" },
    { name: "免费Wi-Fi", icon: "wifi-icon" },
    { name: "亲子友好", icon: "family-icon" },
  ];
  for (const tag of tags) {
    await prisma.hotelTag.upsert({
      // 使用唯一的 name 来查找，而不是 id
      where: { name: tag.name },
      update: {
        icon: tag.icon,
        // 不要在这里写 id: 1
      },
      create: {
        name: tag.name,
        icon: tag.icon,
        // 不要在这里写 id: 1，数据库会自动生成
      },
    });
  }
  console.log("✅ 标签初始化/更新成功");
  } catch (error) {
    console.error("❌ 酒店标签创建失败：", error);
  }
}
async function createHotelData() {
  try {
    const result = await prisma.hotel.create({
      data: {
        hotelName: "猫之宿景观酒店",
        address: "滨海大道 88 号",
        stars: 5,
        score: 4.8,
        openingTime: "2023-05",
        imageUrl: "/uploads/hotel_cover.jpg",
        status: 1,
        roomTypes: {
          create: [
            {
              name: "豪华大床房",
              price: 599.0,
              capacity: 2,
              bedType: "1.8m大床",
              bedCount: 1,
            }
    
        ]
        },
        // 关键点：改用 name 来连接，这样最保险
        tags: {
          connect: [
            { name: "免费停车" },
            { name: "含早餐" }
          ]
        }
      }
    });
    console.log("✅ 酒店及房型数据写入成功");
  } catch (error) {
    console.error("❌ 写入失败:", error);
  }
}

async function main() {
  await createHotelTags();
    //await createHotelData();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });