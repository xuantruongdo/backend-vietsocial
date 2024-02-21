import { BadRequestException } from '@nestjs/common';

export const ensureUserIsInChat = (chatUsers: any, userId: string): boolean => {
  if (!chatUsers.includes(userId)) {
    throw new BadRequestException('You are not part of this chat group');
  }

  return true;
};
