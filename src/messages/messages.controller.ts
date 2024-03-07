import { Body, Controller, Post } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { AddMessageDto } from './dto/message-dto';

@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post()
  async addMessage(@Body() addMessageDto: AddMessageDto) {
    return this.messagesService.addMessage(addMessageDto);
  }
}
