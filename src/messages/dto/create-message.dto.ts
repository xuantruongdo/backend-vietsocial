import {  IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateMessageDto {
  @IsNotEmpty({
    message: 'Content cannot be blank',
  })
  content: string;

  @IsNotEmpty({
    message: 'ChatId cannot be blank',
  })
  @IsMongoId({ message: 'Chat must be in ObjectId format' })
  chatId: mongoose.Schema.Types.ObjectId;
}
