import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ResponseMessage, UserRequest } from 'src/decorator/customize';
import { IUser } from 'src/types/users.interface';
import { RemoveCommentDto } from './dto/remove-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ResponseMessage("Create a comment")
  @Post(":postId")
  create(@Param('postId') postId: string, @Body() createCommentDto: CreateCommentDto, @UserRequest() user: IUser) {
    return this.commentsService.create(postId, createCommentDto, user);
  }

  @ResponseMessage("Update a comment")
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto, @UserRequest() user: IUser) {
    return this.commentsService.update(id, updateCommentDto, user);
  }

  @ResponseMessage("Delete a comment")
  @Delete(':id')
  remove(@Param('id') id: string, @Body() removeCommentDto: RemoveCommentDto, @UserRequest() user: IUser) {
    return this.commentsService.remove(id, removeCommentDto, user);
  }
}
