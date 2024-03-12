import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { AddMessageDto, GetMessageDto } from './dto/message-dto';
import { Message } from './schema/message.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ChatsService } from 'src/chats/chats.service';
import { UsersService } from 'src/users/users.service';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class MessagesService implements OnModuleInit {
  private chatsService: ChatsService;
  private usersService: UsersService;
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    this.chatsService = this.moduleRef.get(ChatsService, { strict: false });
    this.usersService = this.moduleRef.get(UsersService, { strict: false });
  }

  async addMessage(addMessageDto: AddMessageDto) {
    // Set message as not viewed
    addMessageDto['viewed'] = false;

    const { senderEmail, receiverEmail, sentTime } = addMessageDto;

    // Check if a chat exists
    const chat = await this.chatsService.findChatByEmail(
      senderEmail,
      receiverEmail,
    );

    if (!chat) {
      // Create a new chat
      await this.chatsService.createChat(sentTime, senderEmail, receiverEmail);
    } else {
      // Increase unread messages
      await this.chatsService.increaseUnreadMessages(
        senderEmail,
        receiverEmail,
      );
      // Update last message time
      await this.chatsService.updateLastMessage(
        senderEmail,
        receiverEmail,
        sentTime,
      );
    }

    const newMessage = new this.messageModel(addMessageDto);

    await newMessage.save();
  }

  async getMessages(getMessageDto: GetMessageDto) {
    const { userEmail, friendEmail } = getMessageDto;

    const user = await this.usersService.findUserByEmail(userEmail);
    const friend = await this.usersService.findUserByEmail(friendEmail);

    if (!user || !friend) {
      new BadRequestException('User or friend not found');
    }

    const messages = await this.messageModel.find({
      $or: [
        { senderEmail: userEmail, receiverEmail: friendEmail },
        { senderEmail: friendEmail, receiverEmail: userEmail },
      ],
    });

    return messages;
  }

  async readMessages(userEmail: string, friendEmail: string) {
    await this.messageModel.updateMany(
      { senderEmail: friendEmail, receiverEmail: userEmail },
      { viewed: true },
    );
  }

  async updateUserAvatar(email: string, imageSrc: string) {
    await this.messageModel.updateMany(
      { senderEmail: email },
      { senderImageUrl: imageSrc },
    );
  }
}
