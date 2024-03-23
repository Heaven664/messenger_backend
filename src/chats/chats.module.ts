import { Module, forwardRef } from '@nestjs/common';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from './schema/chats.schema';
import { UsersModule } from 'src/users/users.module';
import { MessagesModule } from 'src/messages/messages.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    forwardRef(() => MessagesModule),
    forwardRef(() => UsersModule),
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
  ],
  controllers: [ChatsController],
  providers: [ChatsService, JwtService],
  exports: [ChatsService],
})
export class ChatsModule {}
