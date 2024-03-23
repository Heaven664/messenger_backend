import {
  Body,
  Controller,
  Get,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@Controller('chats')
export class ChatsController {
  constructor(private chatsService: ChatsService) {}

  @Get()
  async getChats(@Query('email') email: string) {
    return await this.chatsService.findAllChats(email);
  }
  @UseGuards(JwtGuard)
  @Put('read')
  async readChat(
    @Body('userEmail') userEmail: string,
    @Body('friendEmail') friendEmail: string,
    @Req() req,
  ) {
    // Emails in request and token must match
    const { email } = req.user;
    if (email !== userEmail) {
      throw new UnauthorizedException(
        'Email in request and in token do not match',
      );
    }

    return await this.chatsService.clearUnreadMessages(userEmail, friendEmail);
  }
}
