import { JwtService } from '@nestjs/jwt';
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
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

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

  async loginUser(userData: LoginUserDto) {
    // Validate user input for login
    validateLoginInput(userData);

    // Find user by email in database
    const user = await this.userModel.findOne({ email: userData.email });

    // If user not found, throw an error
    if (!user) {
      throw new BadRequestException(InputErrorMessages.INVALID_CREDENTIALS);
    }

    // Compare password with hashed password
    await comparePassword(userData.password, user.password);

    // Return user without password property and replace _id with id
    const returnUserData: UserWithoutPassword = {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      imageSrc: user.imageSrc,
      residency: user.residency,
      lastSeenPermission: user.lastSeenPermission,
      lastSeenTime: user.lastSeenTime,
    };

    // Payload to be extracted from the client request
    const payload = {
      username: user.email,
      sub: {
        name: user.name,
      },
    };

    return {
      user: returnUserData,
      // Generate access and refresh tokens
      backendTokens: {
        accessToken: await this.jwtService.signAsync(payload, {
          expiresIn: '1h',
          secret: process.env.JWT_SECRET_KEY,
        }),
        refreshToken: await this.jwtService.signAsync(payload, {
          expiresIn: '7d',
          secret: process.env.JWT_REFRESH_TOKEN,
        }),
      },
    };
  }

  async findUserById(id: string): Promise<UserWithoutPassword> {
    // Find user by id in database
    const user = await this.userModel.findById(id);

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
