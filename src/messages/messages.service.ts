import { Injectable } from '@nestjs/common';
import { AddMessageDto } from './dto/message-dto';
import { Message } from './schema/message.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) {}

  async addMessage(addMessageDto: AddMessageDto) {
    addMessageDto['viewed'] = false;

    const newMessage = new this.messageModel(addMessageDto);

    await newMessage.save();
  }
}
