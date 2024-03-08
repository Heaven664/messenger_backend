import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { AddMessageDto, GetMessageDto } from './dto/message-dto';

@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post()
  async addMessage(@Body() addMessageDto: AddMessageDto) {
    return this.messagesService.addMessage(addMessageDto);
  }

  @Get()
  async getMessages(
    @Query('user') userEmail: string,
    @Query('friend') friendEmail: string,
  ) {
    const data: GetMessageDto = { userEmail, friendEmail };
    return this.messagesService.getMessages(data);
  }
}
