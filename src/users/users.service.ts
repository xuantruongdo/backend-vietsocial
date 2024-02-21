import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateUserDto,
  RegisterUserDto,
} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { getHashPassword } from 'src/helpers/getHashPassword';
import { compareSync } from 'bcryptjs';
import { MailService } from 'src/mail/mail.service';
import { Role, RoleDocument } from 'src/roles/entities/role.entity';
import { USER_ROLE } from 'src/databases/sample';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>,
    private mailService: MailService,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    const { fullname, email, password } = registerUserDto;

    const isExist = await this.userModel.findOne({ email });

    if (isExist) {
      throw new BadRequestException('Email already exists');
    }

    const hashPassword = getHashPassword(password);

    const userRole = await this.roleModel.findOne({ name: USER_ROLE })

    const newUser = await this.userModel.create({
      fullname,
      email,
      password: hashPassword,
      role: userRole._id,
      isActive: false,
      type: 'SYSTEM',
    });

    // await this.mailService.sendConfirmationEmail(email, fullname);

    return newUser;
  }

  async findOneByEmail(email: string) {
    return await this.userModel.findOne({ email }).populate({
      path: 'role',
      select: {
        _id: 1,
        name: 1,
      },
    });
  }

  async isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async updateRefreshToken(_id: string, refresh_token: string) {
    return await this.userModel.updateOne(
      { _id },
      { refreshToken: refresh_token },
    );
  }

  async findUserByToken(refreshToken: string) {
    return await this.userModel.findOne({ refreshToken }).populate({
      path: 'role',
      select: {
        _id: 1,
        name: 1,
      },
    });
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
