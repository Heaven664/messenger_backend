import { BadRequestException, Injectable } from '@nestjs/common';
import { UserWithoutPassword } from './interfaces/user.interface';
import createUser from './helpers/user.factory';
import validateRegistrationInput from './helpers/RegistrationInputValidation';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto, LoginUserDto } from 'src/shared/dto/create-user.dto';
import { resolveDatabaseError } from './helpers/customDatabaseErrorHandler';
import validateLoginInput from './helpers/LoginInputValidation';
import { comparePassword } from './helpers/validatePassword';
import { InputErrorMessages } from 'src/common/enums/errorMessages.enum';

@Injectable()
export class UsersService {
  // Temporary in-memory array of users
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async registerNewUser(userData: CreateUserDto): Promise<UserWithoutPassword> {
    // Validate user input for registration
    validateRegistrationInput(userData);

    // Create new user object with user factory
    const user = await createUser(userData);

    try {
      // Save user to database
      const newUser = new this.userModel(user);
      await newUser.save();
    } catch (error) {
      // Handle database error
      resolveDatabaseError(error.code);
    }

    // Return newly created user without password property
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async loginUser(userData: LoginUserDto): Promise<UserWithoutPassword> {
    // Validate user input for login
    validateLoginInput(userData);

    // Find user by email in database
    const user = await this.userModel.findOne({ email: userData.email });

    console.log(user);
    // If user not found, throw an error
    if (!user) {
      throw new BadRequestException(InputErrorMessages.INVALID_CREDENTIALS);
    }

    // Compare password with hashed password
    await comparePassword(userData.password, user.password);

    // Return user without password property and replace _id with id
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      imageSrc: user.imageSrc,
      residency: user.residency,
      lastSeenPermission: user.lastSeenPermission,
      lastSeenTime: user.lastSeenTime,
    };
  }
}
