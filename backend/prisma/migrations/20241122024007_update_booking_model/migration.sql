/*
  Warnings:

  - You are about to drop the column `created_at` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `end_time` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `room_id` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `start_time` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `bookings` table. All the data in the column will be lost.
  - Added the required column `applicant` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomId` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Made the column `attendees` on table `bookings` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_room_id_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_user_id_fkey";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "created_at",
DROP COLUMN "end_time",
DROP COLUMN "room_id",
DROP COLUMN "start_time",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     "applicant" TEXT NOT NULL,
ADD COLUMN     "bookerId" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "roomId" TEXT NOT NULL,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "attendees" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_bookerId_fkey" FOREIGN KEY ("bookerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
