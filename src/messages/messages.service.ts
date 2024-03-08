import { BadRequestException, Injectable } from '@nestjs/common';
import { AddMessageDto, GetMessageDto } from './dto/message-dto';
import { Message } from './schema/message.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ChatsService } from 'src/chats/chats.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private chatsService: ChatsService,
    private usersService: UsersService,
  ) {}

  async addMessage(addMessageDto: AddMessageDto) {
    addMessageDto['viewed'] = false;

    const { senderEmail, receiverEmail, sentTime } = addMessageDto;

    const chat = await this.chatsService.findChatByEmail(
      senderEmail,
      receiverEmail,
    );

    if (!chat) {
      await this.chatsService.createChat(sentTime, senderEmail, receiverEmail);
    } else {
      await this.chatsService.increaseUnreadMessages(
        senderEmail,
        receiverEmail,
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
}
