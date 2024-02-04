import { BadRequestException, Injectable } from '@nestjs/common';
import { UserWithoutPassword } from './interfaces/user.interface';
import createUser from './helpers/user.factory';
import validateInput from './helpers/inputValidation';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/shared/dto/create-user.dto';
import { InputErrorMessages } from 'src/common/enums/errorMessages.enum';

@Injectable()
export class UsersService {
  // Temporary in-memory array of users
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(userData: CreateUserDto): Promise<UserWithoutPassword> {
    // Validate user input
    validateInput(userData);

    // Create new user object with user factory
    const user = await createUser(userData);

    try {
      // Save user to database
      const newUser = new this.userModel(user);
      await newUser.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(InputErrorMessages.UserAlreadyExists);
      }
    }

    // Return newly created user without password property
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }
}
