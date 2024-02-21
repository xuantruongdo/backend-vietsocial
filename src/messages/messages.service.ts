import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from './entities/message.entity';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Chat, ChatDocument } from 'src/chats/entities/chat.entity';
import { IUser } from 'src/types/users.interface';
import { checkUserInChat } from 'src/helpers/checkUserInChat';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: SoftDeleteModel<MessageDocument>,
    @InjectModel(Chat.name) private chatModel: SoftDeleteModel<ChatDocument>,
  ) {}

  async create(createMessageDto: CreateMessageDto, user: IUser) {
    const { content, chatId } = createMessageDto;

    const existChat = await this.chatModel.findOne({ _id: chatId });

    if (!existChat) {
      throw new BadRequestException('Chat does not exist');
    }

    checkUserInChat(existChat, user._id);

    const newMessage = await this.messageModel.create({
      ...createMessageDto,
      sender: user._id,
      createdBy: {
        _id: user?._id,
        email: user?.email,
      },
    });

    await this.chatModel.findByIdAndUpdate(chatId, {
      latestMessage: newMessage._id,
    });

    return newMessage.populate([
      { path: 'sender', select: { _id: 1, fullname: 1, email: 1, avatar: 1 } },
      {
        path: 'chatId',
        select: {
          _id: 1,
          chatName: 1,
          isGroupChat: 1,
          users: 1,
          latestMessage: 1,
          groupAdmin: 1,
        },
      },
    ]);
  }

  async findAll(chatId: string, user: IUser) {
    const chat = await this.chatModel.findById(chatId);

    if (!chat) {
      throw new BadRequestException('Chat does not exist');
    }

    if (!chat.users.includes(user._id as any)) {
      throw new BadRequestException('You do not have permission to view the chat');
    }

    return await this.messageModel.find({ chatId }).populate([
      { path: 'sender', select: { _id: 1, fullname: 1, email: 1, avatar: 1 } },
      {
        path: 'chatId',
        select: {
          _id: 1,
          chatName: 1,
          isGroupChat: 1,
          users: 1,
          latestMessage: 1,
          groupAdmin: 1,
        },
      },
    ]);
  }
}
