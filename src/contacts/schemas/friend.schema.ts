import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FriendDocument = HydratedDocument<Friend>;

@Schema()
export class Friend {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  imageSrc: string;

  @Prop()
  residency: string;

  @Prop()
  lastSeenPermission: boolean;

  @Prop()
  lastSeenTime: number;
}

export const FriendSchema = SchemaFactory.createForClass(Friend);
