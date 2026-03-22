-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DOCTOR', 'RECEPTIONIST');

-- AlterTable
ALTER TABLE "doctors" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'DOCTOR';
