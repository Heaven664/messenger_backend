import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  imageSrc: string;

  @Prop()
  residency: string;

  @Prop()
  lastSeenPermission: boolean;

  @Prop()
  lastSeenTime: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
