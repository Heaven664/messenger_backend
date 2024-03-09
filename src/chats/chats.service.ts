import { BadRequestException, Injectable } from '@nestjs/common';
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

  // Create new chat
  async createChat(
    lastMessage: number,
    senderEmail: string,
    receiverEmail: string,
  ) {
    // Check if user and friend exist
    const user = await this.usersService.findUserByEmail(senderEmail);
    const friend = await this.usersService.findUserByEmail(receiverEmail);

    // Destructure user data
    const {
      id: userId,
      email: userEmail,
      name: userName,
      imageSrc: userImage,
      lastSeenTime: userLastSeenTime,
      lastSeenPermission: userLastSeenPermission,
    } = user;

    // Destructure friend data
    const {
      id: friendId,
      email: friendEmail,
      name: friendName,
      imageSrc: friendImage,
      lastSeenPermission: friendLastSeenPermission,
      lastSeenTime: friendLastSeenTime,
    } = friend;

    // Check if user and friend exist
    if (!user || !friend) {
      throw new BadRequestException('User or friend not found');
    }

    // Create chat data for a friend
    const firstChatData = new this.chatModel({
      userId: friendId,
      name: friendName,
      userEmail: userEmail,
      friendEmail: friendEmail,
      imageUrl: friendImage,
      lastMessage,
      unreadMessages: 0,
      lastSeenPermission: friendLastSeenPermission,
      lastSeenTime: friendLastSeenTime,
    });

    // Create chat data for a user
    const secondChatData = new this.chatModel({
      userId: userId,
      name: userName,
      userEmail: friendEmail,
      friendEmail: userEmail,
      imageUrl: userImage,
      lastMessage: lastMessage,
      unreadMessages: 1,
      lastSeenPermission: userLastSeenPermission,
      lastSeenTime: userLastSeenTime,
    });

    // Create a char for user and friend
    await secondChatData.save();
    return await firstChatData.save();
  }

  async findChatByEmail(userEmail: string, friendEmail: string) {
    return await this.chatModel.findOne({ userEmail, friendEmail });
  }

  async findAllChats(userEmail: string) {
    const chats = await this.chatModel.find({ userEmail }, { _id: 0, __v: 0 });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return chats;
  }

  async increaseUnreadMessages(userEmail: string, friendEmail: string) {
    return await this.chatModel.findOneAndUpdate(
      { userEmail: friendEmail, friendEmail: userEmail },
      { $inc: { unreadMessages: 1 } },
    );
  }

  async updateLastMessage(
    userEmail: string,
    friendEmail: string,
    lastMessageTime: number,
  ) {
    return await this.chatModel.updateMany(
      {
        $or: [
          { userEmail, friendEmail },
          { userEmail: friendEmail, friendEmail: userEmail },
        ],
      },
      { lastMessage: lastMessageTime },
    );
  }
  async clearUnreadMessages(userEmail: string, friendEmail: string) {
    return await this.chatModel.find(
      { userEmail: friendEmail, friendEmail: userEmail },
      { unreadMessages: 0 },
    );
  }
}
