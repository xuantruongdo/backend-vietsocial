import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Public, ResponseMessage, UserRequest } from 'src/decorator/customize';
import { IUser } from 'src/types/users.interface';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @ResponseMessage('Create a group')
  @Post()
  create(@Body() createGroupDto: CreateGroupDto, @UserRequest() user: IUser) {
    return this.groupsService.create(createGroupDto, user);
  }

  @Public()
  @ResponseMessage('Fetch all groups')
  @Get()
  findAll() {
    return this.groupsService.findAll();
  }

  @Public()
  @ResponseMessage('Fetch group by id')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @ResponseMessage('Update group')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @UserRequest() user: IUser,
  ) {
    return this.groupsService.update(id, updateGroupDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @UserRequest() user: IUser) {
    return this.groupsService.remove(id, user);
  }
}
