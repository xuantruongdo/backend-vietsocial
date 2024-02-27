import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { AddUserToGroupDto, CreateChatDto, CreateChatGroupDto, UpdateChatNameGroupDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { ResponseMessage, UserRequest } from 'src/decorator/customize';
import { IUser } from 'src/types/users.interface';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @ResponseMessage("Access chat")
  @Post()
  accessChat(@Body() createChatDto: CreateChatDto, @UserRequest() user: IUser) {
    return this.chatsService.accessChat(createChatDto, user);
  }

  @ResponseMessage("Create a group chat")
  @Post("/create")
  create(@Body() createChatGroupDto: CreateChatGroupDto, @UserRequest() user: IUser) {
    return this.chatsService.create(createChatGroupDto, user);
  }

  @ResponseMessage("Fetch all chats current user")
  @Get()
  fetchChatsCurrentUser(@UserRequest() user: IUser) {
    return this.chatsService.fetchChatsCurrentUser(user);
  }

  @ResponseMessage("Fetch group chats current user")
  @Get('/group')
  fetchGroupChatsCurrentUser(@UserRequest() user: IUser) {
    return this.chatsService.fetchGroupChatsCurrentUser(user);
  }

  @ResponseMessage("Rename group chat")
  @Patch('/rename/:id')
  renameGroup(@Param('id') id: string, @Body() updateChatNameGroupDto: UpdateChatNameGroupDto, @UserRequest() user: IUser) {
    return this.chatsService.renameGroup(id, updateChatNameGroupDto, user);
  }

  @ResponseMessage("Add user to group chat")
  @Patch('/add/:id')
  addUserToGroup(@Param('id') id: string, @Body() addUserToGroupDto: AddUserToGroupDto, @UserRequest() user: IUser) {
    return this.chatsService.addUserToGroup(id, addUserToGroupDto, user);
  }

  @ResponseMessage("Remove user from group chat")
  @Patch('/remove/:id')
  removeUserFromGroup(@Param('id') id: string, @Body() addUserToGroupDto: AddUserToGroupDto, @UserRequest() user: IUser) {
    return this.chatsService.removeUserFromGroup(id, addUserToGroupDto, user);
  }

  @ResponseMessage("Leave group chat")
  @Patch('/leave/:id')
  leaveGroup(@Param('id') id: string, @UserRequest() user: IUser) {
    return this.chatsService.leaveGroup(id, user);
  }

}
