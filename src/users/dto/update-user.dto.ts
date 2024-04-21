import { IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  fullname: string;

  @IsOptional()
  avatar: string;

  @IsOptional()
  cover: string;

  @IsOptional()
  note: string;

  @IsOptional()
  live: string;

  @IsOptional()
  from: string;

  @IsOptional()
  relationship: string;

  @IsOptional()
  isActive: string;

  @IsOptional()
  isVerify: string;
}
