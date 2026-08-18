import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class B2BAuthGuard extends AuthGuard("jwt-b2b") {}
