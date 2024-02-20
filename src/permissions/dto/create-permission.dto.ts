import { IsNotEmpty } from "class-validator";

export class CreatePermissionDto {
    @IsNotEmpty({ message: "Name cannot be blank" })
    name: string;

    @IsNotEmpty({ message: "ApiPath cannot be blank" })
    apiPath: string;

    @IsNotEmpty({ message: "Method cannot be blank" })
    method: string;

    @IsNotEmpty({ message: "Module cannot be blank" })
    module: string;
}
