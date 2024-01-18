import { BadRequestException, Injectable } from '@nestjs/common';
import { InitialUserData, User } from './interfaces/user.interface';
import createUser from './helpers/user.factory';
import * as emailValidator from 'email-validator';

@Injectable()
export class UsersService {
  // Temporary in-memory array of users
  private readonly users = [];

  async create(userData: InitialUserData): Promise<User> {
    // Check if required fields are missing
    if (!userData.email || !userData.password || !userData.name) {
      throw new BadRequestException('Missing required fields');
    }

    // Check if user already exists
    const userExists = this.users.find((user) => user.email === userData.email);
    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    // Validate email
    if (!emailValidator.validate(userData.email)) {
      throw new BadRequestException('Invalid email');
    }

    // Validate password length
    const MIN_PASSWORD_LENGTH = 6;
    if (userData.password.length < MIN_PASSWORD_LENGTH) {
      throw new BadRequestException(
        'Password must be at least 6 characters long',
      );
    }

    // Create new user object with user factory
    const user = await createUser(userData);
    // Temporary push user to in-memory array
    this.users.push(user);
    console.log('registered users', this.users);
    // Return newly created user
    return user;
  }
}
