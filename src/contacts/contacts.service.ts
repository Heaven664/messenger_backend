import { UsersService } from './../users/users.service';
import { InjectModel } from '@nestjs/mongoose';
import { AddContactDto, RemoveContactDto } from './dto/contact-dto';
import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { Contact } from './schemas/contact.schema';
import { Model } from 'mongoose';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class ContactsService implements OnModuleInit {
  private usersService: UsersService;
  constructor(
    @InjectModel(Contact.name) private contactModel: Model<Contact>,
    private moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    this.usersService = this.moduleRef.get(UsersService, { strict: false });
  }

  async findFriends(email: string) {
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
          id: '$friendship.id',
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
    return savedContact.friendship;
  }

  async removeContact(removeContactDto: RemoveContactDto) {
    const { userEmail, friendEmail } = removeContactDto;

    // If the user tries to remove themselves as a friend, throw an error
    if (userEmail === friendEmail) {
      throw new BadRequestException('You cannot remove unfriend yourself');
    }

    // Find the friendship
    const friendship = await this.findFriendship(userEmail, friendEmail);

    // If the friendship is not found, throw an error
    if (!friendship) {
      throw new BadRequestException('Friendship not found');
    }

    // Remove the friendship
    return await friendship.deleteOne();
  }
  async updateUserAvatar(email: string, imageSrc: string) {
    return this.contactModel.updateMany(
      { friendship: { $elemMatch: { email: email } } },
      { $set: { 'friendship.$.imageSrc': imageSrc } },
    );
  }
}
