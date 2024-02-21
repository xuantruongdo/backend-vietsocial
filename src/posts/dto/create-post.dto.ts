import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePostDto {

  @IsNotEmpty({ message: "Content cannot be blank" })
  content: string;

  @IsOptional()
  image: string;
}
