import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, UserRequest } from 'src/decorator/customize';
import { ActiveUserDto, RegisterUserDto } from 'src/users/dto/create-user.dto';
import { LocalAuthGuard } from './local-auth.guard';
import { Request as RequestType, Response } from 'express';
import { IUser } from 'src/types/users.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ResponseMessage('Register a user')
  @Post('/register')
  handleRegister(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Public()
  @ResponseMessage('Active account')
  @Post('/active')
  handleActive(@Body() activeUserDto: ActiveUserDto) {
    return this.authService.active(activeUserDto);
  }

  @Public()
  @ResponseMessage('Login account')
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  handleLogin(@Req() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response);
  }

  @ResponseMessage('Fetch current account')
  @Get('/account')
  handleFetchCurrentAccount(@UserRequest() user: IUser) {
    return user;
  }

  @Public()
  @ResponseMessage('Refresh token')
  @Post('/refresh')
  handleRefreshToken(
    @Req() request: RequestType,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refresh_token = request.cookies['refresh_token'];
    return this.authService.processNewToken(refresh_token, response);
  }

  @ResponseMessage('Logout account')
  @Post('/logout')
  handleLogout(
    @Res({ passthrough: true }) response: Response,
    @UserRequest() user: IUser
  ) {
    return this.authService.logout(response, user);
  }
}
