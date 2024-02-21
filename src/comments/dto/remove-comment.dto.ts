import { IsNotEmpty } from 'class-validator';

export class RemoveCommentDto {
  @IsNotEmpty({ message: "Post ID cannot be blank" })
  postId: string;
}
