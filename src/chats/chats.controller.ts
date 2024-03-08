import { Body, Controller, Post } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/chats-dto';

@Controller('chats')
export class ChatsController {
  constructor(private chatsService: ChatsService) {}

  @Post()
  async createChat(@Body() createChatDto: CreateChatDto) {
    return this.chatsService.createChat(createChatDto);
  }
}
