import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Public, ResponseMessage, UserRequest } from 'src/decorator/customize';
import { IUser } from 'src/types/users.interface';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @ResponseMessage('Fetch user by email')
  @Get('/email/:email')
  findOneByEmail(@Param('email') email: string) {
    return this.usersService.findOneByEmail(email);
  }

  @ResponseMessage("Follow/Unfollow a user")
  @Post('/follow/:receiverId')
  followUser(@Param('receiverId') receiverId: string, @UserRequest() user: IUser) {
    return this.usersService.followUser(receiverId, user);
  }

  @Public()
  @ResponseMessage("Fetch following users")
  @Get('/following/:id')
  fetchFollowingUsers(@Param('id') id: string) {
    return this.usersService.fetchFollowingUsers(id);
  }

  @Public()
  @ResponseMessage('Fetch user by id')
  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Public()
  @ResponseMessage('Fetch all users')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Public()
  @ResponseMessage("Find all with id array")
  @Post('find-all-with-id')
  findAllWithId(@Body() data: any) {
    return this.usersService.fillAllWithId(data);
  }

  @ResponseMessage("Update information user")
  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @UserRequest() user: IUser) {
    return this.usersService.updateUser(id, updateUserDto, user);
  }

}
