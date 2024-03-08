import { Controller, Get, Query } from '@nestjs/common';
import { ChatsService } from './chats.service';

@Controller('chats')
export class ChatsController {
  constructor(private chatsService: ChatsService) {}

  @Get()
  async getChats(@Query('email') email: string) {
    return await this.chatsService.findAllChats(email);
  }
}
