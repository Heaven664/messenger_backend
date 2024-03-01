import { JwtService } from '@nestjs/jwt';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UserWithoutPassword } from './interfaces/user.interface';
import createUser from './helpers/user.factory';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model, QueryOptions } from 'mongoose';
import { CreateUserDto, LoginUserDto } from 'src/shared/dto/create-user.dto';
import { resolveDatabaseError } from './helpers/customDatabaseErrorHandler';
import { comparePassword } from './helpers/validatePassword';
import { InputErrorMessages } from 'src/common/enums/errorMessages.enum';
import { TOKEN_EXPIRATION_TIME } from 'lib/constants';
import { UpdateLastSeenDto, UpdateUserInfoDto } from './dto/user-dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async registerNewUser(userData: CreateUserDto) {
    // Create new user object with user factory
    const user = await createUser(userData);

    // Save initial password to be returned to the client
    const initialPassword = userData.password;

    try {
      // Save user to database
      const newUser = new this.userModel(user);
      await newUser.save();
    } catch (error) {
      // Handle database error
      resolveDatabaseError(error.code);
    }

    // Payload to be extracted from the client request
    const payload = {
      username: user.email,
      sub: {
        name: user.name,
      },
    };
    // User object to be returned to the client with initial password
    const returnUser = { ...user, password: initialPassword };

    return {
      user: returnUser,
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
        expiresIn: new Date().setTime(
          new Date().getTime() + TOKEN_EXPIRATION_TIME,
        ),
      },
    };
  }

  async loginUser(userData: LoginUserDto) {
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
        expiresIn: new Date().setTime(
          new Date().getTime() + TOKEN_EXPIRATION_TIME,
        ),
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

  async updateUserInfo(
    updateUserInfoDto: UpdateUserInfoDto,
  ): Promise<UserWithoutPassword> {
    // Destructure id and other data from updateUserDto
    const { id, ...newInfoValues } = updateUserInfoDto;
    // Configure options for the update operation
    const operationOptions: QueryOptions = {
      new: true,
      lean: true,
    };

    // Find and modify user by id in database
    const updatedInfo = await this.userModel.findByIdAndUpdate(
      id,
      newInfoValues,
      operationOptions,
    );

    // Return user data
    return {
      id: updatedInfo._id.toString(),
      name: updatedInfo.name,
      email: updatedInfo.email,
      imageSrc: updatedInfo.imageSrc,
      residency: updatedInfo.residency,
      lastSeenPermission: updatedInfo.lastSeenPermission,
      lastSeenTime: updatedInfo.lastSeenTime,
    };
  }

  async updateLastSeenPermission(
    updateLastSeenDto: UpdateLastSeenDto,
  ): Promise<UserWithoutPassword> {
    // Extract id and lastSeenPermission from updateLastSeenDto
    const { id, ...lastSeenPermission } = updateLastSeenDto;

    // Configure options for the update operation
    const operationOptions: QueryOptions = {
      new: true,
      lean: true,
    };

    // Find user by id and change lastSeenPermission in database
    const updatedInfo = await this.userModel.findByIdAndUpdate(
      id,
      lastSeenPermission,
      operationOptions,
    );

    // Return user data
    return {
      id: updatedInfo._id.toString(),
      name: updatedInfo.name,
      email: updatedInfo.email,
      imageSrc: updatedInfo.imageSrc,
      residency: updatedInfo.residency,
      lastSeenPermission: updatedInfo.lastSeenPermission,
      lastSeenTime: updatedInfo.lastSeenTime,
    };
  }
}
