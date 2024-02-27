import mongoose from 'mongoose';

export interface IUser {
    _id: string;
    email: string;
    fullname: string;
    avatar: string;
    cover: string;
    role: mongoose.Schema.Types.ObjectId;
    isActive: boolean;
    isVerify: boolean;
    type: string;
    note: string;
    live: string;
    from: string;
    relationship: string;
    followers: mongoose.Types.ObjectId[];
    followings: mongoose.Types.ObjectId[];
    permissions?: {
        _id: string;
        name: string;
        apiPath: string;
        module: string;
    }[]
}
