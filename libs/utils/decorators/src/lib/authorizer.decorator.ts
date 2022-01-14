import { AccountDocument, UserDocument } from '@castcle-api/database/schemas';
import { CastcleException } from '@castcle-api/utils/exception';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export class Authorizer {
  constructor(public account: AccountDocument, public user: UserDocument) {}

  /**
   * permit if target user ID is `me` (case-insensitive) or same as user ID
   * @param {string} targetUserId Target user ID to access
   */
  requestAccessForUser(targetUserId: string) {
    const isMe = targetUserId.toLowerCase() === 'me';
    const isSameId = this.user.id === targetUserId;
    const isSameCastcleId = this.user.displayId === targetUserId;

    if (isMe || isSameId || isSameCastcleId) return;

    throw CastcleException.FORBIDDEN;
  }
}

export const Auth = createParamDecorator(
  async (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const account = request.$credential.account;
    const user = await request.$user;

    return new Authorizer(account, user);
  }
);