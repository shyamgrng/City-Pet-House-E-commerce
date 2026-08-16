import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class OwnerAuthGuard extends AuthGuard("jwt-owner") {}
