import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './entities/post.entity';
import { Group, GroupSchema } from 'src/groups/entities/group.entity';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Group.name, schema: GroupSchema },
    ]),
    RolesModule
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
