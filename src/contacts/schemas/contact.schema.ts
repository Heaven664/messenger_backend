import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserWithoutPassword } from 'src/users/interfaces/user.interface';
import { FriendSchema } from './friend.schema';

export type ContactDocument = HydratedDocument<Contact>;

@Schema()
export class Contact {
  @Prop({ type: [{ type: FriendSchema }] })
  friendship: UserWithoutPassword[];
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
