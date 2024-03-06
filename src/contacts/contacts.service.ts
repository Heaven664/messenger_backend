import { UsersService } from './../users/users.service';
import { InjectModel } from '@nestjs/mongoose';
import { AddContactDto, FindFriendsDto } from './dto/contact-dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Contact } from './schemas/contact.schema';
import { Model } from 'mongoose';

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel(Contact.name) private contactModel: Model<Contact>,
    private readonly usersService: UsersService,
  ) {}

  async findFriends(findFriendsDto: FindFriendsDto) {
    const { email } = findFriendsDto;
    // Find the user's friends
    return await this.contactModel.aggregate([
      {
        // Find documents where the user's email is in the friendship array
        $match: { 'friendship.email': email },
      },
      // Unwind the friendship array
      { $unwind: '$friendship' },
      {
        // Project the fields we want to return
        $project: {
          _id: 0,
          name: '$friendship.name',
          email: '$friendship.email',
          imageSrc: '$friendship.imageSrc',
          residency: '$friendship.residency',
          lastSeenPermission: '$friendship.lastSeenPermission',
          lastSeenTime: '$friendship.lastSeenTime',
        },
      },
      {
        // Remove documents with the user's own email from the results
        $match: { email: { $ne: email } },
      },
    ]);
  }

  async findFriendship(userEmail: string, friendEmail: string) {
    // Check if there is a friendship between the two users
    return await this.contactModel.findOne({
      $and: [
        { 'friendship.email': userEmail },
        { 'friendship.email': friendEmail },
      ],
    });
  }

  async addContact(addContactDto: AddContactDto) {
    const { email: userEmail, friendEmail } = addContactDto;

    // If the user tries to add themselves as a friend, throw an error
    if (userEmail === friendEmail) {
      throw new BadRequestException('You cannot add yourself as a friend');
    }

    // Lookup the users in database
    const secondUser = await this.usersService.findUserByEmail(friendEmail);
    const firstUser = await this.usersService.findUserByEmail(userEmail);

    // If user either user is not found, throw an error
    if (!firstUser || !secondUser) {
      throw new BadRequestException('User not found');
    }
    // If the two users are the same, throw an error
    if (await this.findFriendship(userEmail, friendEmail)) {
      throw new BadRequestException('You are already friends');
    }

    // Create a new contact object
    const contact = new this.contactModel();
    contact.friendship = [firstUser, secondUser];
    const savedContact = await contact.save();
    return savedContact;
  }
}
