import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { AddMessageDto, GetMessageDto } from './dto/message-dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @UseGuards(JwtGuard)
  @Post()
  async addMessage(@Body() addMessageDto: AddMessageDto, @Req() req) {
    // Sender email should match with the user email in the token
    const { senderEmail } = addMessageDto;
    const { email: userEmail } = req.user;
    // If sender email does not match with the user email in the token, throw an error
    if (senderEmail !== userEmail)
      throw new UnauthorizedException(
        'Sender email does not match with the user email in the token',
      );

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
