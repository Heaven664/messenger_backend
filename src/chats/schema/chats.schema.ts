import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChatDocument = HydratedDocument<Chat>;

@Schema()
export class Chat {
  @Prop()
  userId: string;

  @Prop()
  name: string;

  @Prop()
  userEmail: string;

  @Prop()
  friendEmail: string;

  @Prop()
  imageUrl: string;

  @Prop()
  unreadMessages: number;

  @Prop()
  lastMessage: number;

  @Prop()
  lastSeenPermission: boolean;

  @Prop()
  lastSeenTime: number;

  @Prop()
  isOnline: boolean;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
