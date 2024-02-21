import { IsNotEmpty, IsOptional } from "class-validator";
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
    members: mongoose.Types.ObjectId[];

}
