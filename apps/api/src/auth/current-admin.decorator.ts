import { createParamDecorator, ExecutionContext, ForbiddenException } from "@nestjs/common";

export interface CurrentAdmin {
  userId: string;
  adminProfileId: string;
  staffRole: string;
  permissions: Record<string, boolean>;
}

export const CurrentAdmin = createParamDecorator((_data: unknown, ctx: ExecutionContext): CurrentAdmin => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});

/** Per-section permission check (dashboard/deliveries/vetconsults/shop/finance/users) — call at the top of a controller method. */
export function requirePermission(admin: CurrentAdmin, section: string): void {
  if (!admin.permissions[section]) {
    throw new ForbiddenException(`Your account doesn't have access to ${section}.`);
  }
}
