/*
  Warnings:

  - You are about to drop the column `bookerId` on the `bookings` table. All the data in the column will be lost.
  - Added the required column `userId` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_bookerId_fkey";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "bookerId",
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'APPROVED';

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
