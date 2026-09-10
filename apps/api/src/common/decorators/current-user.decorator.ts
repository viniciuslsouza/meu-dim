import {
  createParamDecorator,
  type ExecutionContext
} from "@nestjs/common";

export interface CurrentUserData {
  id: string;
  email: string;
}

interface RequestWithUser {
  user?: CurrentUserData;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): CurrentUserData | undefined =>
    context.switchToHttp().getRequest<RequestWithUser>().user
);
