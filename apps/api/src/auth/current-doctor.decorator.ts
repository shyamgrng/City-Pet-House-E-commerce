import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface CurrentDoctor {
  userId: string;
  doctorProfileId: string;
}

export const CurrentDoctor = createParamDecorator((_data: unknown, ctx: ExecutionContext): CurrentDoctor => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
