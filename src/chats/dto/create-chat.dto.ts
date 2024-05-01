import { IsArray, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import mongoose from 'mongoose';

export class CreateChatDto {
  @IsNotEmpty({
    message: 'Receiver ID cannot be blank',
  })
  @IsMongoId({ message: 'Receiver ID must be in ObjectId format' })
  receiverId: mongoose.Schema.Types.ObjectId;
}

export class CreateChatGroupDto {
  @IsNotEmpty({
    message: 'Chat name cannot be blank',
  })
  chatName: string;

  @IsNotEmpty({ message: 'Users cannot be blank' })
  @IsMongoId({ each: true, message: 'Each user must be in ObjectId format' })
  @IsArray({ message: 'Users is in array format' })
  users: mongoose.Schema.Types.ObjectId[];
}

export class AddUserToGroupDto {
  @IsNotEmpty({ message: 'Users cannot be blank' })
  @IsMongoId({ each: true, message: 'Each user must be in ObjectId format' })
  @IsArray({ message: 'Users is in array format' })
  users: mongoose.Schema.Types.ObjectId[];
}

export class UpdateChatNameGroupDto {
  @IsNotEmpty({
    message: 'ReceivedId không được để trống',
  })
  chatName: string;
}

export class UpdateGroupDto {
  @IsOptional()
  chatName: string;

  @IsOptional()
  users: string[];
}
