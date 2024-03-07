import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { AddContactDto } from './dto/contact-dto';

@Controller('contacts')
export class ContactsController {
  constructor(private contactsService: ContactsService) {}

  @Post('add')
  async addContact(@Body() addContactDto: AddContactDto) {
    return this.contactsService.addContact(addContactDto);
  }

  @Get('friends')
  async findFriends(@Query('email') email: string) {
    return this.contactsService.findFriends(email);
  }
}
