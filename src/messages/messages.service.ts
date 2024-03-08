import { Injectable } from '@nestjs/common';
import { AddMessageDto } from './dto/message-dto';
import { Message } from './schema/message.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ChatsService } from 'src/chats/chats.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private chatsService: ChatsService,
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
}
