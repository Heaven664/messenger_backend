import { JwtService } from '@nestjs/jwt';
import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
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
import { UpdateUserInfoDto } from './dto/user-dto';
import { MessagesService } from 'src/messages/messages.service';
import { ModuleRef } from '@nestjs/core';
import { ChatsService } from 'src/chats/chats.service';
import { ContactsService } from 'src/contacts/contacts.service';

@Injectable()
export class UsersService implements OnModuleInit {
  private messagesService: MessagesService;
  private chatsService: ChatsService;
  private contactsService: ContactsService;
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly jwtService: JwtService,
    private moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    this.messagesService = this.moduleRef.get(MessagesService, {
      strict: false,
    });
    this.chatsService = this.moduleRef.get(ChatsService, { strict: false });
    this.contactsService = this.moduleRef.get(ContactsService, {
      strict: false,
    });
  }

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
      email: user.email,
      id: user.id,
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
      email: user.email,
      id: user.id,
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

    // Handle if user not found and throw an error
    if (!user) {
      throw new BadRequestException('User not found');
    }

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

  async findUserByEmail(email: string): Promise<UserWithoutPassword> {
    const user = await this.userModel.findOne({ email });

    // Handle if user not found and throw an error
    if (!user) {
      throw new BadRequestException('User not found');
    }

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
    email: string,
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

    // Update last seen permission in chats and contacts
    await this.chatsService.updateUserInfo(updatedInfo.name, email);
    await this.contactsService.updateUserInfo(
      updatedInfo.name,
      email,
      updatedInfo.residency,
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

  async updateUserAvatar(email: string, imageSrc: string) {
    await this.userModel.findOneAndUpdate({ email }, { imageSrc });
    await this.messagesService.updateUserAvatar(email, imageSrc);
    await this.chatsService.updateUserAvatar(email, imageSrc);
    await this.contactsService.updateUserAvatar(email, imageSrc);
  }

  async updateLastSeenPermission({
    email,
    id,
    lastSeenPermission,
  }): Promise<UserWithoutPassword> {
    // Configure options for the update operation
    const operationOptions: QueryOptions = {
      new: true,
      lean: true,
    };

    // Find user by id and change lastSeenPermission in database
    const updatedInfo = await this.userModel.findByIdAndUpdate(
      id,
      { lastSeenPermission },
      operationOptions,
    );

    // Update last seen permission in chats and contacts
    await this.chatsService.updateLastSeenPermission(
      updatedInfo.lastSeenPermission,
      email,
    );
    await this.contactsService.updateLastSeenPermission(
      lastSeenPermission,
      email,
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
