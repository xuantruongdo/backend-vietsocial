import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Public, ResponseMessage, UserRequest } from 'src/decorator/customize';
import { IUser } from 'src/types/users.interface';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @ResponseMessage("Send a mesage")
  @Post()
  create(@Body() createMessageDto: CreateMessageDto, @UserRequest() user: IUser) {
    return this.messagesService.create(createMessageDto, user);
  }

  @ResponseMessage("Fetch all mesages in chat group")
  @Get(':chatId')
  findAll(@Param('chatId') chatId: string, @UserRequest() user: IUser) {
    return this.messagesService.findAll(chatId, user);
  }
}
