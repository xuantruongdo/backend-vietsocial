import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Post, PostDocument } from './entities/post.entity';
import { IUser } from 'src/types/users.interface';
import { checkPostOwnership } from 'src/helpers/checkPostOwnership';
import { Types } from 'mongoose';
import { checkViewPostInGroup } from 'src/helpers/checkGroupMember';
import { Group, GroupDocument } from 'src/groups/entities/group.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: SoftDeleteModel<PostDocument>,
    @InjectModel(Group.name) private groupModel: SoftDeleteModel<GroupDocument>,
  ) {}

  async create(createPostDto: CreatePostDto, user: IUser) {
    const newPost = await this.postModel.create({
      ...createPostDto,
      author: user._id,
      createdBy: {
        _id: user?._id,
        email: user?.email,
      },
    });
    return {
      _id: newPost?._id,
      createdAt: newPost.createdAt,
    };
  }

  async findAll() {
    const allPosts = await this.postModel
      .find()
      .sort('-createdAt')
      .populate([
        { path: 'groupId', select: 'isPublic' },
        { path: 'author', select: '_id fullname email avatar' },
        { path: 'likes', select: '_id fullname email avatar' },
        {
          path: 'comments',
          select: '_id content createdAt',
          populate: {
            path: 'user',
            select: { _id: 1, fullname: 1, email: 1, avatar: 1 },
          },
        },
      ]);

    const publicPosts = allPosts.filter(
      //@ts-ignore
      (post) => !post.groupId || post.groupId.isPublic,
    );

    return publicPosts;
  }

  async findAllWithAuthor(userId: string) {
    return await this.postModel
      .find({
        author: userId,
        $and: [{ groupId: null }, { groupId: { $exists: false } }],
      })
      .sort('-createdAt')
      .populate([
        {
          path: 'author',
          select: { _id: 1, fullname: 1, email: 1, avatar: 1 },
        },
        { path: 'likes', select: { _id: 1, fullname: 1, email: 1, avatar: 1 } },
        {
          path: 'comments',
          populate: {
            path: 'user',
            select: { _id: 1, fullname: 1, email: 1, avatar: 1 },
          },
          select: { content: 1, user: 1, createdAt: 1 },
        },
      ]);
  }

  async findAllWithGroup(groupId: string, user: IUser) {
    const group = await this.groupModel.findById(groupId);

    if (!group) {
      throw new BadRequestException('Group does not exist');
    }

    checkViewPostInGroup(group.admin, user._id, group.isPublic);

    return await this.postModel
      .find({ groupId })
      .sort('-createdAt')
      .populate([
        {
          path: 'author',
          select: { _id: 1, fullname: 1, email: 1, avatar: 1 },
        },
        { path: 'likes', select: { _id: 1, fullname: 1, email: 1, avatar: 1 } },
        {
          path: 'comments',
          populate: {
            path: 'user',
            select: { _id: 1, fullname: 1, email: 1, avatar: 1 },
          },
          select: { content: 1, user: 1, createdAt: 1 },
        },
      ]);
  }

  async findOne(_id: string) {
    return await this.postModel.findById(_id).populate([
      { path: 'author', select: { _id: 1, fullname: 1, email: 1 } },
      { path: 'likes', select: { _id: 1, fullname: 1, email: 1 } },
      {
        path: 'comments',
        populate: {
          path: 'user',
          select: { _id: 1, fullname: 1, email: 1, avatar: 1 },
        },
        select: { content: 1, user: 1 },
      },
    ]);
  }

  async update(_id: string, updatePostDto: UpdatePostDto, user: IUser) {
    const post = await this.postModel.findById(_id);

    if (!post) {
      throw new BadRequestException('Post does not exist');
    }

    checkPostOwnership(post?.author.toString(), user);

    return await this.postModel.updateOne(
      { _id },
      {
        ...updatePostDto,
        updatedBy: {
          _id: user?._id,
          email: user?.email,
        },
      },
    );
  }

  async remove(_id: string, user: IUser) {
    const post = await this.postModel.findById(_id);

    if (!post) {
      throw new BadRequestException('Post does not exist');
    }

    checkPostOwnership(post?.author.toString(), user);

    await this.postModel.updateOne(
      { _id },
      {
        deletedBy: {
          _id: user?._id,
          email: user?.email,
        },
      },
    );

    return this.postModel.softDelete({ _id });
  }

  async like(_id: string, user: IUser) {
    const post = await this.postModel.findById(_id);

    if (!post) {
      throw new BadRequestException('Post does not exist');
    }

    const userId = new Types.ObjectId(user._id);
    const userLiked = post.likes.some((likeId) => likeId.equals(userId));

    if (userLiked) {
      // Nếu người dùng đã thích bài viết, xóa user._id khỏi mảng likes
      post.likes = post.likes.filter((likeId) => !likeId.equals(userId));
    } else {
      // Nếu người dùng chưa thích bài viết, thêm user._id vào mảng likes
      post.likes.push(userId);
    }

    // Lưu bài viết đã được cập nhật
    await post.save();

    // Trả về bài viết đã cập nhật
    return post.populate([
      { path: 'author', select: { _id: 1, fullname: 1, email: 1, avatar: 1 } },
      { path: 'likes', select: { _id: 1, fullname: 1, email: 1, avatar: 1 } },
      {
        path: 'comments',
        populate: {
          path: 'user',
          select: { _id: 1, fullname: 1, email: 1, avatar: 1 },
        },
        select: { content: 1, user: 1, createdAt: 1 },
      },
    ]);
  }
}
