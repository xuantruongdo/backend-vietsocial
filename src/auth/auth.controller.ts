import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, UserRequest } from 'src/decorator/customize';
import { ActiveUserDto, ChangePasswordDto, ForgetPasswordDto, GetCodeDto, RegisterUserDto } from 'src/users/dto/create-user.dto';
import { LocalAuthGuard } from './local-auth.guard';
import { Request as RequestType, Response } from 'express';
import { IUser } from 'src/types/users.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ResponseMessage('Register a user')
  @Post('/register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Public()
  @ResponseMessage('Active account')
  @Post('/active')
  active(@Body() activeUserDto: ActiveUserDto) {
    return this.authService.active(activeUserDto);
  }

  @Public()
  @ResponseMessage('Generate new password')
  @Post('/forget')
  forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return this.authService.forgetPassword(forgetPasswordDto);
  }

  @Public()
  @ResponseMessage('Send code by email')
  @Post('/code')
  sendAuthenticationCode(@Body() getCodeDto: GetCodeDto) {
    return this.authService.sendAuthenticationCode(getCodeDto);
  }

  @ResponseMessage("Change password")
  @Patch('/password')
  handleChangePassword( @Body() changePasswordDto: ChangePasswordDto, @UserRequest() user: IUser) {
    return this.authService.changePassword( changePasswordDto, user);
  }

  @Public()
  @ResponseMessage('Login account')
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(@Req() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response);
  }

  @ResponseMessage('Fetch current account')
  @Get('/account')
  fetchCurrentAccount(@UserRequest() user: IUser) {
    return user;
  }

  @Public()
  @ResponseMessage('Refresh token')
  @Post('/refresh')
  refreshToken(
    @Req() request: RequestType,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refresh_token = request.cookies['refresh_token'];
    return this.authService.processNewToken(refresh_token, response);
  }

  @ResponseMessage('Logout account')
  @Post('/logout')
  logout(
    @Res({ passthrough: true }) response: Response,
    @UserRequest() user: IUser
  ) {
    return this.authService.logout(response, user);
  }
}
