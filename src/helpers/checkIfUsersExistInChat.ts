import { BadRequestException } from '@nestjs/common';
import mongoose from 'mongoose';
import { IUserIdArray } from 'src/types/array.interface';

export const checkIfUsersExistInChat = (chatUsers: mongoose.Types.ObjectId[], usersToAdd: mongoose.Types.ObjectId[]) : boolean => {
  const userExistsInChat = usersToAdd.some((userId) => chatUsers.includes(userId));
  if (userExistsInChat) {
    throw new BadRequestException(
      'At least 1 member already exists in the group',
    );
  }

  return userExistsInChat;
};
