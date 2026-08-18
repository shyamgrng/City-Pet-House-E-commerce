import { Controller, Get } from "@nestjs/common";
import { VetService } from "./vet.service";

@Controller("vet")
export class VetController {
  constructor(private readonly vet: VetService) {}

  @Get("status")
  status() {
    return this.vet.status();
  }

  @Get("doctors")
  doctors() {
    return this.vet.doctors();
  }
}
