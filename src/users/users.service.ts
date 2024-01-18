import { BadRequestException, Injectable } from '@nestjs/common';
import { InitialUserData, User } from './interfaces/user.interface';
import createUser from './helpers/user.factory';
import validateInput from './helpers/inputValidation';
import { InputErrorMessages } from 'src/common/enums/errorMessages.enum';

@Injectable()
export class UsersService {
  // Temporary in-memory array of users
  private readonly users = [];

  async create(userData: InitialUserData): Promise<User> {
    // Validate user input
    validateInput(userData);

    // Check if user with the same email already exists
    const userExists = this.users.find((user) => user.email === userData.email);
    if (userExists) {
      throw new BadRequestException(InputErrorMessages.UserAlreadyExists);
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
