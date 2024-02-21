import { BadRequestException, Injectable } from '@nestjs/common';
import { AddUserToGroupDto, CreateChatDto, CreateChatGroupDto, UpdateChatNameGroupDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Chat, ChatDocument } from './entities/chat.entity';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/types/users.interface';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { ensureUserIsInChat } from 'src/helpers/ensureUserIsInChat';
import { checkIfUsersExistInChat } from 'src/helpers/checkIfUsersExistInChat';
import { Types } from 'mongoose';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Chat.name) private chatModel: SoftDeleteModel<ChatDocument>,
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  async accessChat(createChatDto: CreateChatDto, user: IUser) {
    const { receiverId } = createChatDto;

    const existUser = await this.userModel.findById(receiverId);

    if (!existUser) {
      throw new BadRequestException('User does not exist');
    }

    if (user._id === receiverId.toString()) {
      throw new BadRequestException('Cannot create group chat with only you');
    }

    let chat = await this.chatModel
      .find({
        isGroupChat: false,
        $and: [
          { users: { $elemMatch: { $eq: user._id } } },
          { users: { $elemMatch: { $eq: receiverId } } },
        ],
      })
      .populate([
        {
          path: 'latestMessage',
          populate: {
            path: 'sender',
            select: { _id: 1, fullname: 1, email: 1, avatar: 1 },
          },
          select: { content: 1, sender: 1 },
        },
        { path: 'users', select: { _id: 1, fullname: 1, email: 1, avatar: 1 } },
      ]);

    if (chat.length > 0) {
      return chat[0];
    } else {
      let chatData = {
        chatName: 'sender',
        users: [user._id, receiverId],
        createdBy: {
          _id: user?._id,
          email: user?.email,
        },
      };

      const newChat = await this.chatModel.create(chatData);

      return newChat.populate([
        {
          path: 'latestMessage',
          populate: {
            path: 'sender',
            select: { _id: 1, fullname: 1, email: 1, avatar: 1 },
          },
          select: { content: 1, sender: 1 },
        },
        { path: 'users', select: { _id: 1, fullname: 1, email: 1, avatar: 1 } },
      ]);
    }
  }

  async create(createChatGroupDto: CreateChatGroupDto, user: IUser) {
    const { chatName, users } = createChatGroupDto;

    //@ts-ignore
    if (users.includes(user._id)) {
      throw new BadRequestException('Cannot create group chat with yourself',);
    }

    if (users.length < 2) {
      throw new BadRequestException('The chat group must have at least 3 people',);
    }

    const newGroupChat = await this.chatModel.create({
      chatName,
      users: [...users, user._id],
      isGroupChat: true,
      groupAdmin: user._id,
      createdBy: {
        _id: user?._id,
        email: user?.email,
      },
    });

    return newGroupChat.populate([
      {
        path: 'latestMessage',
        populate: {
          path: 'sender',
          select: { _id: 1, fullname: 1, email: 1, avatar: 1 },
        },
        select: { content: 1, sender: 1 },
      },
      { path: 'users', select: { _id: 1, fullname: 1, email: 1, avatar: 1 } },
      { path: 'groupAdmin', select: { _id: 1, fullname: 1, email: 1, avatar: 1 } },
    ]);
  }

  async fetchChatsCurrentUser(user: IUser) {
    return this.chatModel.find({users: { $elemMatch: { $eq: user._id } },})
      .sort('-updatedAt')
      .populate([
        {
          path: 'latestMessage',
          populate: {
            path: 'sender',
            select: { _id: 1, fullname: 1, email: 1, avatar: 1 },
          },
          select: { content: 1, sender: 1 },
        },
        { path: 'users', select: { _id: 1, fullname: 1, email: 1, avatar: 1 } },
        { path: 'groupAdmin', select: { _id: 1, fullname: 1, email: 1, avatar: 1 },},
      ]);
  }

  async renameGroup(_id: string, updateChatNameGroupDto: UpdateChatNameGroupDto, user: IUser) {
    const { chatName } = updateChatNameGroupDto;
    await this.chatModel.updateOne(
      { _id },
      {
        chatName,
        updatedBy: {
          _id: user?._id,
          email: user?.email,
        },
      },
    );

    return await this.chatModel.findById(_id);
  }

  async addUserToGroup(_id: string, addUserToGroupDto: AddUserToGroupDto, user: IUser,) {
    const { users } = addUserToGroupDto;

    const chat = await this.chatModel.findById(_id);

    if (!chat) {
      throw new BadRequestException('Chat does not exist');
    }

    ensureUserIsInChat(chat.users, user._id);

    //@ts-ignore
    checkIfUsersExistInChat(chat.users, users);

    //@ts-ignore
    chat.users = [...chat.users, ...users];

    await chat.save();

    return chat.populate([
      {
        path: 'latestMessage',
        populate: {
          path: 'sender',
          select: { _id: 1, fullname: 1, email: 1, avatar: 1 },
        },
        select: { content: 1, sender: 1 },
      },
      { path: 'users', select: { _id: 1, fullname: 1, email: 1, avatar: 1 } },
      {
        path: 'groupAdmin',
        select: { _id: 1, fullname: 1, email: 1, avatar: 1 },
      },
    ]);
  }

  async removeUserFromGroup(_id: string, addUserToGroupDto: AddUserToGroupDto, user: IUser,) {
    const { users } = addUserToGroupDto;

    let chat = await this.chatModel.findById(_id);

    if (!chat) {
      throw new BadRequestException('Chat does not exist');
    }

    if (chat.groupAdmin.toString() !== user._id) {
      throw new BadRequestException('Only admins have the right to delete');
    }

    if (users.includes(user?._id as any)) {
      throw new BadRequestException('Cannot delete admin');
    }

    if (chat.users.length - users.length < 3) {
      throw new BadRequestException('Chat must have at least 3 members');
    }

    const allUsersExistInChat = users.every((user) => chat.users.includes(user as any))

    if (!allUsersExistInChat) {
      throw new BadRequestException("Contains a member's code that is not part of the chat");
    }

    chat.users = chat.users.filter((user) => users.includes(user.toString() as any))

    await chat.save();

    return chat.populate([
      {
        path: 'latestMessage',
        populate: {
          path: 'sender',
          select: { _id: 1, fullname: 1, email: 1, avatar: 1 },
        },
        select: { content: 1, sender: 1 },
      },
      { path: 'users', select: { _id: 1, fullname: 1, email: 1, avatar: 1 } },
      {
        path: 'groupAdmin',
        select: { _id: 1, fullname: 1, email: 1, avatar: 1 },
      },
    ]);
  }

  async leaveGroup(_id: string, user: IUser) {
    let chat = await this.chatModel.findById(_id);

    if (!chat) {
      throw new BadRequestException('Chat does not exist');
    }

    if (!chat?.isGroupChat) {
      throw new BadRequestException('You cannot leave the direct chat');
    }

    if (!chat.users.includes(user?._id as any)) {
      throw new BadRequestException('You are not in the chat');
    }

    if (chat.groupAdmin.toString() === user._id) {
      await this.chatModel.updateOne(
        { _id },
        {
          deletedBy: {
            _id: user?._id,
            email: user?.email,
          },
        },
      );
  
      return this.chatModel.softDelete({ _id });
    }

    chat.users = chat.users.filter((userId) => userId.toString() !== user._id)

    await chat.save();

    return 'ok';
  }

}
