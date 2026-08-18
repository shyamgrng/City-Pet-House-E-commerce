import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface CurrentB2B {
  userId: string;
  b2bProfileId: string;
}

export const CurrentB2B = createParamDecorator((_data: unknown, ctx: ExecutionContext): CurrentB2B => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
