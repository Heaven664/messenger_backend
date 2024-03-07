import { Injectable } from '@nestjs/common';
import { AddMessageDto } from './dto/message-dto';

@Injectable()
export class MessagesService {
  async addMessage(addMessageDto: AddMessageDto) {
    console.log(addMessageDto);
  }
}
