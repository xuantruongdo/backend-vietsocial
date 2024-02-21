import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { IUser } from 'src/types/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Group, GroupDocument } from './entities/group.entity';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { checkGroupAdmin } from 'src/helpers/checkGroupAdmin';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private groupModel: SoftDeleteModel<GroupDocument>,
  ) {}

  async create(createGroupDto: CreateGroupDto, user: IUser) {
    const newGroup = await this.groupModel.create({
      ...createGroupDto,
      admin: [user._id],
      createdBy: {
        _id: user?._id,
        email: user?.email,
      },
    });
    return {
      _id: newGroup?._id,
      createdAt: newGroup.createdAt,
    };
  }

  async findAll() {
    return await this.groupModel.find();
  }

  async findOne(_id: string) {
    return await this.groupModel.findById(_id);
  }

  update(id: number, updateGroupDto: UpdateGroupDto) {
    return `This action updates a #${id} group`;
  }

  async remove(_id: string, user: IUser) {
    const group = await this.groupModel.findById(_id);

    if (!group) {
      throw new BadRequestException("Group does not exist")
    }

    checkGroupAdmin(group.admin, user._id)

    await this.groupModel.updateOne(
      { _id },
      {
        deletedBy: {
          _id: user?._id,
          email: user?.email,
        },
      },
    );

    return this.groupModel.softDelete({ _id });

  }
}
