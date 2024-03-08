import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChatDocument = HydratedDocument<Chat>;

@Schema()
export class Chat {
  @Prop()
  name: string;

  @Prop()
  userEmail: string;

  @Prop()
  friendEmail: string;

  @Prop()
  friendImage: string;

  @Prop()
  unreadMessages: number;

  @Prop()
  lastMessage: number;

  @Prop()
  lastSeenPermission: boolean;

  @Prop()
  lastSeenTime: number;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
