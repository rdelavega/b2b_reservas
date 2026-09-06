-- DropForeignKey
ALTER TABLE "Mesa" DROP CONSTRAINT "Mesa_sucursalId_fkey";

-- AddForeignKey
ALTER TABLE "Mesa" ADD CONSTRAINT "Mesa_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
