import { IsArray, IsMongoId, IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreateRoleDto {
    @IsNotEmpty({ message: "Name cannot be blank" })
    name: string;

    @IsNotEmpty({ message: "Description cannot be blank" })
    description: string;

    @IsNotEmpty({ message: "IsActive cannot be blank" })
    isActive: string;

    @IsNotEmpty({ message: "Permission cannot be blank" })
    @IsMongoId({ each: true, message: "Each permission must be in ObjectId format"})
    @IsArray({ message: "Permission is in array format" })
    permissions: mongoose.Schema.Types.ObjectId[];
}
