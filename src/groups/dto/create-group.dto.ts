import { IsArray, IsMongoId, IsNotEmpty, IsOptional } from "class-validator";
import mongoose from "mongoose";

export class CreateGroupDto {
    @IsNotEmpty({ message: "Name cannot be blank" })
    name: string;
  
    @IsNotEmpty({ message: "IsPublic cannot be blank" })
    isPublic: boolean;
  
    @IsNotEmpty({ message: "Category cannot be blank" })
    category: string;
  
    @IsNotEmpty({ message: "Description cannot be blank" })
    description: string;

    @IsOptional()
    @IsMongoId({ each: true, message: 'Each member must be in ObjectId format' })
    @IsArray({ message: 'Members is in array format' })
    members: mongoose.Types.ObjectId[];

}
