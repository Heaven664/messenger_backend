import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { UserWithoutPassword } from './interfaces/user.interface';
import createUser from './helpers/user.factory';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import mongoose, { Model, QueryOptions } from 'mongoose';
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
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  // Get module references to avoid circular dependencies
  onModuleInit() {
    this.messagesService = this.moduleRef.get(MessagesService, {
      strict: false,
    });
    this.chatsService = this.moduleRef.get(ChatsService, { strict: false });
    this.contactsService = this.moduleRef.get(ContactsService, {
      strict: false,
    });
  }

  /**
   * Registers a new user and returns user data and access and refresh tokens
   * @param userData User data to register
   * @returns User data and access and refresh tokens
   * @throws BadRequestException if user already exists or database error
   */
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

    // Generate JWT payload
    const payload = {
      email: user.email,
      id: user.id,
    };

    // User object to be returned to the client with initial password
    const returnUser = { ...user, password: initialPassword };

    // Return user data and with access and refresh tokens
    return {
      user: returnUser,
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

  /**
   * Logs in a user and returns user data and access and refresh tokens
   * @param userData User data to login
   * @returns An object with user data and access and refresh tokens
   * @throws BadRequestException if user not found or password is invalid
   */
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

    // Generate JWT payload
    const payload = {
      email: user.email,
      id: user.id,
    };

    // Return user data and with access and refresh tokens
    return {
      user: returnUserData,
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

  /**
   * Finds a user by id and returns a user object without password property
   * @param id A user id for a query
   * @returns A user object without password property
   * @throws BadRequestException if user not found
   */
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

  /**
   * Finds a user by email and returns a user object without password property
   * @param email A user email for a query
   * @returns A user object without password property
   * @throws BadRequestException if user not found
   */
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

  /**
   * Updates user info in all related collections within a transaction
   * @param updateUserInfoDto A DTO with user data to update
   * @param email A user email for queries
   * @returns Updated user data
   * @throws ConflictException if transaction fails
   */
  async updateUserInfo(
    updateUserInfoDto: UpdateUserInfoDto,
    email: string,
  ): Promise<UserWithoutPassword> {
    const { id, ...newInfoValues } = updateUserInfoDto;

    // Configure options for the update operation
    const operationOptions: QueryOptions = {
      new: true,
      lean: true,
    };

    // Start a session
    const session = await this.connection.startSession();

    // Start a transaction
    session.startTransaction();
    try {
      // Find and modify user by id in database
      const updatedInfo = await this.userModel
        .findByIdAndUpdate(id, newInfoValues, operationOptions)
        .session(session);

      // Update last seen permission in chats and contacts
      await this.chatsService.updateUserInfo(updatedInfo.name, email, session);
      await this.contactsService.updateUserInfo(
        updatedInfo.name,
        email,
        updatedInfo.residency,
        session,
      );

      // Commit the transaction
      await session.commitTransaction();

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
    } catch (error) {
      console.log(error);
      // Abort the transaction
      await session.abortTransaction();
      throw new ConflictException('Update failed');
    } finally {
      // End the session
      session.endSession();
    }
  }

  /**
   * Updates a user avatar in all related collections within a transaction
   * @param email An email address of a user to update
   * @param imageSrc New image source to update
   */
  async updateUserAvatar(email: string, imageSrc: string) {
    // Start a session
    const session = await this.connection.startSession();

    // Update imageSrc in user, messages, chats and contacts within a transaction
    await session.withTransaction(async () => {
      await this.userModel
        .findOneAndUpdate({ email }, { imageSrc })
        .session(session);
      await this.messagesService.updateUserAvatar(email, imageSrc, session);
      await this.chatsService.updateUserAvatar(email, imageSrc, session);
      await this.contactsService.updateUserAvatar(email, imageSrc, session);
    });
    // End the session
    session.endSession();
  }

  /**
   * Updates last seen permission in all related collections within a transaction
   * @param object An object with user email and lastSeenPermission
   * @returns A user object with updated lastSeenPermission
   * @throws ConflictException if transaction fails
   */
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

    // Start a session
    const session = await this.connection.startSession();

    // Start a transaction
    session.startTransaction();

    try {
      // Find user by id and change lastSeenPermission in database
      const updatedInfo = await this.userModel
        .findByIdAndUpdate(id, { lastSeenPermission }, operationOptions)
        .session(session);

      // Update last seen permission in chats and contacts
      await this.chatsService.updateLastSeenPermission(
        lastSeenPermission,
        email,
        session,
      );
      await this.contactsService.updateLastSeenPermission(
        lastSeenPermission,
        email,
        session,
      );

      // Commit the transaction
      await session.commitTransaction();

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
    } catch (error) {
      console.log(error);
      // Abort the transaction
      await session.abortTransaction();
      throw new ConflictException('Update failed');
    } finally {
      // End the session
      session.endSession();
    }
  }
}
