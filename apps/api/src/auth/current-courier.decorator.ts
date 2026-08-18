import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface CurrentCourier {
  userId: string;
  courierProfileId: string;
}

export const CurrentCourier = createParamDecorator((_data: unknown, ctx: ExecutionContext): CurrentCourier => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
