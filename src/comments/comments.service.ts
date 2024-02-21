import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment, CommentDocument } from './entities/comment.entity';
import { Post, PostDocument } from 'src/posts/entities/post.entity';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/types/users.interface';
import { RemoveCommentDto } from './dto/remove-comment.dto';
import { Types } from 'mongoose';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private commentModel: SoftDeleteModel<CommentDocument>,
    @InjectModel(Post.name)
    private postModel: SoftDeleteModel<PostDocument>,
  ) {}

  async create(postId: string, createCommentDto: CreateCommentDto, user: IUser) {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new BadRequestException('Post does not exist');
    }

    const newComment = await this.commentModel.create({
      ...createCommentDto,
      user: user?._id,
      createdBy: {
        _id: user?._id,
        email: user?.email,
      },
    });

    post.comments.unshift(newComment._id);

    await post.save();

    return {
      _id: newComment?._id,
      createdAt: newComment.createdAt,
    };
  }

  findAll() {
    return `This action returns all comments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  async update(_id: string, updateCommentDto: UpdateCommentDto, user: IUser) {
    return await this.commentModel.updateOne(
      { _id },
      {
        ...updateCommentDto,
        updatedBy: {
          _id: user?._id,
          email: user?.email,
        },
      },
    );
  }

  async remove(_id: string, removeCommentDto: RemoveCommentDto, user: IUser) {
    const { postId } = removeCommentDto;

    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new BadRequestException('Post does not exist');
    }

    const commentId = new Types.ObjectId(_id);
    if (post.comments.some((id) => !id.equals(commentId))) {
      throw new BadRequestException('This comment does not exist in this post');
    }

    post.comments = post.comments.filter((id) => !id.equals(commentId));

    await Promise.all([
      post.save(),
      this.commentModel.updateOne(
        { _id },
        {
          deletedBy: {
            _id: user?._id,
            email: user?.email,
          },
        },
      ),
    ]);

    return this.commentModel.softDelete({ _id });
  }
}
