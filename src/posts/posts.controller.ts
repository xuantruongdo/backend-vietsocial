import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Public, ResponseMessage, UserRequest } from 'src/decorator/customize';
import { IUser } from 'src/types/users.interface';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ResponseMessage('Create a post')
  @Post()
  create(@Body() createPostDto: CreatePostDto, @UserRequest() user: IUser) {
    return this.postsService.create(createPostDto, user);
  }

  @Public()
  @ResponseMessage('Fetch all posts')
  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Public()
  @ResponseMessage('Fetch posts with author')
  @Get('/author/:userId')
  findAllWithAuthor(@Param('userId') userId: string) {
    return this.postsService.findAllWithAuthor(userId);
  }

  @ResponseMessage('Fetch posts in group')
  @Get('/group/:groupId')
  findAllWithGroup(@Param('groupId') groupId: string, @UserRequest() user: IUser) {
    return this.postsService.findAllWithGroup(groupId, user);
  }

  @Public()
  @ResponseMessage("Fetch posts with paginate")
  @Get('/paginate')
  fetchAllPaginate(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string,
  ) {
    return this.postsService.fetchAllPaginate(+currentPage, +limit, qs);
  }

  @Public()
  @ResponseMessage('Fetch a post by id')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @ResponseMessage('Update a post')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UserRequest() user: IUser,
  ) {
    return this.postsService.update(id, updatePostDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @UserRequest() user: IUser) {
    return this.postsService.remove(id, user);
  }

  @ResponseMessage('Like/Unlike a post')
  @Post('like/:id')
  handleLike(@Param('id') id: string, @UserRequest() user: IUser) {
    return this.postsService.like(id, user);
  }
}
