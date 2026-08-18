import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { CatalogModule } from "./catalog/catalog.module";
import { CartModule } from "./cart/cart.module";
import { OrdersModule } from "./orders/orders.module";
import { AccountModule } from "./account/account.module";
import { UploadsModule } from "./uploads/uploads.module";
import { ContentModule } from "./content/content.module";
import { AdminModule } from "./admin/admin.module";
import { VetModule } from "./vet/vet.module";
import { DoctorModule } from "./doctor/doctor.module";
import { B2BModule } from "./b2b/b2b.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CatalogModule,
    CartModule,
    OrdersModule,
    AccountModule,
    UploadsModule,
    ContentModule,
    AdminModule,
    VetModule,
    DoctorModule,
    B2BModule,
  ],
})
export class AppModule {}
