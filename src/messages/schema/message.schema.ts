import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

@Schema()
export class Message {
  @Prop()
  senderEmail: string;

  @Prop()
  receiverEmail: string;

  @Prop()
  messageBody: string;

  @Prop()
  senderImageUrl: string;

  @Prop()
  sentTime: number;

  @Prop()
  viewed: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
