import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {}

export class RegisterUserDto {
  @IsEmail(
    {},
    {
      message: 'Email invalidate',
    },
  )
  @IsNotEmpty({
    message: 'Email cannot be blank',
  })
  email: string;

  @IsNotEmpty({
    message: 'Password cannot be blank',
  })
  password: string;

  @IsNotEmpty({
    message: 'Fullname cannot be blank',
  })
  fullname: string;
}

export class ActiveUserDto {
  @IsEmail(
    {},
    {
      message: 'Email invalidate',
    },
  )
  @IsNotEmpty({
    message: 'Email cannot be blank',
  })
  email: string;

  @IsNotEmpty({
    message: 'Confirmation code cannot be blank',
  })
  confirmationCode: Number;

}

export class ForgetPasswordDto {
  @IsEmail(
    {},
    {
      message: 'Email invalidate',
    },
  )
  @IsNotEmpty({
    message: 'Email cannot be blank',
  })
  email: string;

  @IsNotEmpty({
    message: 'Confirmation code cannot be blank',
  })
  confirmationCode: Number;

}

export class ChangePasswordDto {

  @IsNotEmpty({
    message: 'The current password cannot be blank',
  })
  currentPassword: string;

  @IsNotEmpty({
    message: 'The new password cannot be blank',
  })
  newPassword: string;
}


export class GetCodeDto {
  @IsEmail(
    {},
    {
      message: 'Email invalidate',
    },
  )
  @IsNotEmpty({
    message: 'Email cannot be blank',
  })
  email: string;

}