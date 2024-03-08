import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/chats-dto';
import { InjectModel } from '@nestjs/mongoose';
import { Chat } from './schema/chats.schema';
import { Model } from 'mongoose';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    private usersService: UsersService,
  ) {}

  async createChat(createChatDto: CreateChatDto) {
    const {
      userEmail,
      friendEmail,
      friendImage,
      lastMessage,
      lastSeenPermission,
      lastSeenTime,
    } = createChatDto;

    // Check if user and friend exist
    const user = await this.usersService.findUserByEmail(userEmail);
    const friend = await this.usersService.findUserByEmail(friendEmail);

    if (!user || !friend) {
      throw new BadRequestException('User or friend not found');
    }

    const firstChatData = new this.chatModel({
      userEmail,
      friendEmail,
      friendImage,
      lastMessage,
      unreadMessages: 0,
      lastSeenPermission,
      lastSeenTime,
    });

    const secondChatData = new this.chatModel({
      userEmail: friendEmail,
      friendEmail: userEmail,
      friendImage,
      lastMessage,
      unreadMessages: 1,
      lastSeenPermission,
      lastSeenTime,
    });

    await secondChatData.save();
    return await firstChatData.save();
  }
}
