import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateUserDto,
} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { compareSync } from 'bcryptjs';
import { MailService } from 'src/mail/mail.service';
import { Role, RoleDocument } from 'src/roles/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

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
