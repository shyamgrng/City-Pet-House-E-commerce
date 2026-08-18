import { Module } from "@nestjs/common";
import { VetService } from "./vet.service";
import { VetController } from "./vet.controller";
import { VetBookingsController } from "./vet-bookings.controller";

@Module({
  controllers: [VetController, VetBookingsController],
  providers: [VetService],
})
export class VetModule {}
