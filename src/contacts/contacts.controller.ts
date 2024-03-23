import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { AddContactDto, RemoveContactDto } from './dto/contact-dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@Controller('contacts')
export class ContactsController {
  constructor(private contactsService: ContactsService) {}

  @UseGuards(JwtGuard)
  @Post('add')
  async addContact(@Body() addContactDto: AddContactDto, @Req() req) {
    // Email should match with the user email in the token
    const { email } = req.user;
    console.log(email, addContactDto.email);
    if (addContactDto.email !== email)
      throw new UnauthorizedException(
        'Email does not match with the user email in the token',
      );

    return this.contactsService.addContact(addContactDto);
  }

  @Get('friends')
  async findFriends(@Query('email') email: string) {
    return this.contactsService.findFriends(email);
  }

  @Delete('unfriend')
  async removeContact(@Body() removeContactDto: RemoveContactDto) {
    return this.contactsService.removeContact(removeContactDto);
  }
}
