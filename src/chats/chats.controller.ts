import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import { ChatsService } from './chats.service';

@Controller('chats')
export class ChatsController {
  constructor(private chatsService: ChatsService) {}

  @Get()
  async getChats(@Query('email') email: string) {
    return await this.chatsService.findAllChats(email);
  }
  @Put('read')
  async readChat(
    @Body('userEmail') userEmail: string,
    @Body('friendEmail') friendEmail: string,
  ) {
    return await this.chatsService.clearUnreadMessages(userEmail, friendEmail);
  }
}
