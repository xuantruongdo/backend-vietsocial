import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fullname: string;

  @Prop({ default: 'no-avatar.png' })
  avatar: string;

  @Prop()
  cover: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId })
  role: mongoose.Schema.Types.ObjectId;

  @Prop()
  isActive: boolean;

  
  @Prop({default: false})
  isVerify: boolean;

  @Prop()
  type: string;

  @Prop()
  note: string;

  @Prop()
  live: string;

  @Prop()
  from: string;

  @Prop()
  relationship: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], default: [], ref: User.name })
  friends: mongoose.Types.ObjectId[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], default: [], ref: User.name })
  followings: mongoose.Types.ObjectId[];

  @Prop()
  refreshToken: string;

  @Prop()
  confirmationCode: Number;

  @Prop({ type: Object })
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  deletedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
