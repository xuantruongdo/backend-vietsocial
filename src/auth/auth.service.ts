import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import ms from 'ms';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { USER_ROLE } from 'src/databases/sample';
import { createRefreshToken } from 'src/helpers/createRefreshToken';
import { generateRandomString } from 'src/helpers/generateRandomString';
import { getHashPassword } from 'src/helpers/getHashPassword';
import { MailService } from 'src/mail/mail.service';
import { RolesService } from 'src/roles/roles.service';
import { IUser } from 'src/types/users.interface';
import {
  ActiveUserDto,
  ChangePasswordDto,
  ForgetPasswordDto,
  GetCodeDto,
  RegisterUserDto,
} from 'src/users/dto/create-user.dto';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private rolesService: RolesService,
    private mailService: MailService,
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    const { fullname, email, password } = registerUserDto;

    const isExist = await this.userModel.findOne({ email });

    if (isExist) {
      throw new BadRequestException('Email already exists');
    }

    const hashPassword = getHashPassword(password);

    const userRole = await this.rolesService.findOneByName(USER_ROLE);

    const newUser = await this.userModel.create({
      fullname,
      email,
      password: hashPassword,
      role: userRole._id,
      isActive: false,
      type: 'SYSTEM',
    });

    await this.mailService.sendConfirmationEmail(email);

    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt,
    };
  }

  async active(activeUserDto: ActiveUserDto) {
    const { email, confirmationCode } = activeUserDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new BadRequestException('Account does not exist');
    }

    if (user.isActive) {
      throw new BadRequestException('Account has been activated');
    }

    if (user.confirmationCode !== Number(confirmationCode)) {
      throw new BadRequestException(
        'Activation code is incorrect. Please try again',
      );
    }

    return await user.updateOne({ isActive: true });
  }

  async sendAuthenticationCode(getCodeDto: GetCodeDto) {
    const { email } = getCodeDto;
    await this.mailService.sendConfirmationEmail(email);
  }

  async login(user: IUser, response: Response) {
    const { _id, fullname, email, avatar, role, permissions } = user;

    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      fullname,
      email,
      avatar,
      role,
    };

    const refresh_token = createRefreshToken(
      this.jwtService,
      this.configService,
      payload,
    );

    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
    });

    await this.usersService.updateRefreshToken(_id, refresh_token);
    return {
      access_token: this.jwtService.sign(payload),
      user: { _id, fullname, email, avatar, role, permissions },
    };
  }

  async forgetPassword(forgetPasswordDto: ForgetPasswordDto) {
    const { email, confirmationCode } = forgetPasswordDto;
    const user = await this.userModel.findOne({ email });

    if (user.confirmationCode !== confirmationCode) {
      throw new BadRequestException(
        'Activation code is incorrect. Please try again',
      );
    }

    const randomPassword = generateRandomString();

    const hashPassword = getHashPassword(randomPassword);

    await this.mailService.sendNewPassword(email, randomPassword);

    return await user.updateOne({ password: hashPassword });
  }

  async changePassword(changePasswordDto: ChangePasswordDto, user: IUser) {
    const { currentPassword, newPassword } = changePasswordDto;
    const userCurrent = await this.userModel.findOne({ _id: user?._id });
    const isValid = await this.usersService.isValidPassword(
      currentPassword,
      userCurrent.password,
    );

    if (!isValid) {
      throw new BadRequestException('Incorrect password');
    }

    const hashPassword = getHashPassword(newPassword);
    return await this.userModel.updateOne(
      { _id: user?._id },
      {
        password: hashPassword,
      },
    );
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new BadRequestException('Email does not exist');
    }

    const isValid = await this.usersService.isValidPassword(
      pass,
      user.password,
    );

    if (!isValid) {
      throw new BadRequestException('Incorrect password');
    }

    const userRole = user.role as unknown as { _id: string; name: string };
    const temp = await this.rolesService.findOne(userRole._id);

    const objectUser = {
      ...user.toObject(),
      permissions: temp?.permissions ?? [],
    };

    return user;
  }

  async processNewToken(refresh_token_cookie: string, response: Response) {
    try {
      const user =
        await this.usersService.findUserByToken(refresh_token_cookie);
      const { _id, fullname, email, avatar, role } = user;

      const payload = {
        sub: 'token login',
        iss: 'from server',
        _id,
        fullname,
        email,
        avatar,
      };

      const refresh_token = createRefreshToken(
        this.jwtService,
        this.configService,
        payload,
      );

      await this.usersService.updateRefreshToken(_id.toString(), refresh_token);

      response.clearCookie('refresh_token');

      response.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
      });

      const userRole = user.role as unknown as { _id: string; name: string };

      const temp = await this.rolesService.findOne(userRole._id);

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          _id,
          fullname,
          email,
          avatar,
          role,
          permissions: temp?.permissions ?? [],
        },
      };
    } catch (err) {
      throw new BadRequestException('Refresh token is not valid! Please login');
    }
  }

  async logout(response: Response, user: IUser) {
    await this.usersService.updateRefreshToken(user._id, '');
    response.clearCookie('refresh_token');
    return 'ok';
  }

  async fetchCurrentAccount(user: IUser) {
    const { _id, fullname, email, avatar, role, permissions } = user;

    return await this.usersService.findOneByEmail(email);
  }
}
