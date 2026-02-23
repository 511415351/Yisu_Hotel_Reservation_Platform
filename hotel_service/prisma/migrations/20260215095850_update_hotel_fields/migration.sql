-- CreateTable
CREATE TABLE `Hotel` (
    `id` VARCHAR(191) NOT NULL,
    `hotelName` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `stars` INTEGER NOT NULL,
    `score` DECIMAL(65, 30) NOT NULL,
    `openingTime` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoomType` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `price` DECIMAL(65, 30) NOT NULL,
    `capacity` INTEGER NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `bedType` VARCHAR(191) NOT NULL,
    `bedCount` INTEGER NOT NULL,
    `hasTV` BOOLEAN NOT NULL DEFAULT true,
    `hasWifi` BOOLEAN NOT NULL DEFAULT true,
    `hasWindow` BOOLEAN NOT NULL DEFAULT true,
    `hasBathtub` BOOLEAN NOT NULL DEFAULT false,
    `hotelId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HotelTag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NULL,

    UNIQUE INDEX `HotelTag_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_HotelToHotelTag` (
    `A` VARCHAR(191) NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_HotelToHotelTag_AB_unique`(`A`, `B`),
    INDEX `_HotelToHotelTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RoomType` ADD CONSTRAINT `RoomType_hotelId_fkey` FOREIGN KEY (`hotelId`) REFERENCES `Hotel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_HotelToHotelTag` ADD CONSTRAINT `_HotelToHotelTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `Hotel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_HotelToHotelTag` ADD CONSTRAINT `_HotelToHotelTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `HotelTag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
