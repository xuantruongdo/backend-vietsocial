import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { compareSync } from 'bcryptjs';
import { IUser } from 'src/types/users.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  async findOneByEmail(email: string) {
    const user = await this.userModel
      .findOne({ email })
      .select('-refreshToken -confirmationCode');

    if (!user) {
      throw new BadRequestException('User does not exist');
    }
    return user.populate({
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

  async followUser(receiverId: string, user: IUser) {
    try {
      const sentUser = await this.userModel.findById(user?._id);
      const receivedUser = await this.userModel.findById(receiverId);

      if (!sentUser || !receivedUser) {
        throw new BadRequestException('User does not exist');
      }

      const followingIndex = sentUser.followings.indexOf(receivedUser._id);

      const followerIndex = receivedUser.followers.indexOf(sentUser._id);

      if (followingIndex !== -1) {
        sentUser.followings.splice(followingIndex, 1);
      } else {
        sentUser.followings.push(receivedUser._id);
      }

      if (followerIndex !== -1) {
        receivedUser.followers.splice(followerIndex, 1);
      } else {
        receivedUser.followers.push(sentUser._id);
      }

      await this.userModel.findByIdAndUpdate(receiverId, receivedUser);

      await this.userModel.findByIdAndUpdate(sentUser._id, sentUser);

      return 'ok';
    } catch (error) {
      throw new Error('Error saving user information');
    }
  }

  async fetchFollowingUsers(id: string) {
    return await this.userModel
      .findById(id)
      .select('followings')
      .populate({
        path: 'followings',
        select: { _id: 1, fullname: 1, email: 1, avatar: 1 },
      });
  }

  async findOne(id: string) {
    return await this.userModel
      .findById(id)
      .select('-password -refreshToken -confirmationCode')
      .populate({ path: 'role', select: { _id: 1, name: 1 } });
  }

  async findAll() {
    return this.userModel
      .find()
      .select('-password -refreshToken -confirmationCode');
  }

  async fillAllWithId(data: any) {
    const { ids } = data;
    const onlineUsers = this.userModel
      .find({ _id: { $in: ids } })
      .select('-password -refreshToken -confirmationCode');

    return onlineUsers;
  }

  async updateUser(_id: string, updateUserDto: UpdateUserDto, user: IUser) {
    if (_id !== user?._id) {
      throw new BadRequestException(
        'You do not have permission to change user information',
      );
    }

    return await this.userModel.updateOne(
      { _id },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
  }
}
