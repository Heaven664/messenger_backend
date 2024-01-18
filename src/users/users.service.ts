import { Injectable } from '@nestjs/common';
import { InitialUserData, User } from './interfaces/user.interface';
import createUser from './helpers/user.factory';

@Injectable()
export class UsersService {
  // Temporary in-memory array of users
  private readonly users = [];

  async create(userData: InitialUserData): Promise<User> {
    // Create new user object with user factory
    const user = createUser(userData);
    // Temporary push user to in-memory array
    this.users.push(user);
    // Return newly created user
    return user;
  }
}
