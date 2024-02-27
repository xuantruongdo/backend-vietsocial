import { IsOptional } from 'class-validator';
import mongoose from 'mongoose';

export class CreatePostDto {
  @IsOptional()
  content: string;

  @IsOptional()
  image: string;

  @IsOptional()
  groupId: mongoose.Schema.Types.ObjectId;
}
