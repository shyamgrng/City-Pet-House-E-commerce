import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class CourierAuthGuard extends AuthGuard("jwt-courier") {}
