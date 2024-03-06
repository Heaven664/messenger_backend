import { Body, Controller, Get, Post } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { AddContactDto, FindFriendsDto } from './dto/contact-dto';

@Controller('contacts')
export class ContactsController {
  constructor(private contactsService: ContactsService) {}

  @Post('add')
  async addContact(@Body() addContactDto: AddContactDto) {
    return this.contactsService.addContact(addContactDto);
  }

  @Get('friends')
  async findFriends(@Body() findFriendsDto: FindFriendsDto) {
    return this.contactsService.findFriends(findFriendsDto);
  }
}
