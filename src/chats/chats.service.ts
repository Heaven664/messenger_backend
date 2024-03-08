import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/chats-dto';

@Injectable()
export class ChatsService {
  async createChat(createChatDto: CreateChatDto) {
    console.log(createChatDto);
  }
}
