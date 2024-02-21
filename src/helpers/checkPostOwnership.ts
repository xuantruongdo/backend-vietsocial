import { BadRequestException } from '@nestjs/common';
import { IUser } from 'src/types/users.interface';

export function checkPostOwnership(postAuthorId: string, user: IUser): boolean {
  if (postAuthorId !== user?._id) {
    throw new BadRequestException(
      'You do not have permission to edit this post',
    );
  }

  return true;
}
