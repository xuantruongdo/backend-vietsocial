import { BadRequestException } from "@nestjs/common";

export function checkUserInChat(existChat: any, userId: string): boolean {
  if (!existChat.users.includes(userId)) {
      throw new BadRequestException('The user is not in the chat');
  }

  return true;
}
