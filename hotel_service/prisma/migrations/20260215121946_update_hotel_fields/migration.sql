/*
  Warnings:

  - You are about to drop the column `hasBathtub` on the `RoomType` table. All the data in the column will be lost.
  - You are about to drop the column `hasTV` on the `RoomType` table. All the data in the column will be lost.
  - You are about to drop the column `hasWifi` on the `RoomType` table. All the data in the column will be lost.
  - You are about to drop the column `hasWindow` on the `RoomType` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `RoomType` DROP COLUMN `hasBathtub`,
    DROP COLUMN `hasTV`,
    DROP COLUMN `hasWifi`,
    DROP COLUMN `hasWindow`;
