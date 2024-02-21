import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from './entities/role.entity';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/types/users.interface';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>) { }

  async create(createRoleDto: CreateRoleDto, user: IUser) {

    const { name, description, isActive, permissions } = createRoleDto;

    const isExist = await this.roleModel.findOne({ name });

    if (isExist) {
      throw new BadRequestException(`Role với name = ${name} đã tồn tại`);
    }

    const newRole = await this.roleModel.create({
      ...createRoleDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })

    return {
      _id: newRole?._id,
      createdAt: newRole?.createdAt
    }
  }

  findAll() {
    return `This action returns all roles`;
  }

  async findOne(id: string) {
    return await this.roleModel.findOne({
      _id: id
    }).populate({ path: "permissions", select: { _id: 1, name: 1, apiPath: 1, method: 1, module: 1 } })
  }

  async findOneByName(name: string) {
    return await this.roleModel.findOne({
      name
    }).populate({ path: "permissions", select: { _id: 1, name: 1, apiPath: 1, method: 1, module: 1 } })
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
