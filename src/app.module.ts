import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MongoConnectionString } from 'config/mongo.config';
import { ContactsModule } from './contacts/contacts.module';
import { MessagesModule } from './messages/messages.module';
import { ChatsModule } from './chats/chats.module';
import { ImagesModule } from './images/images.module';

// Configure the environment file based on the NODE_ENV environment variable
const ENV = process.env.NODE_ENV;
const ENV_FILE = ENV ? `.env.${ENV}` : '.env';
console.log(`Using environment file: ${ENV_FILE}`);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ENV_FILE,
    }),
    AuthModule,
    UsersModule,
    MongooseModule.forRoot(MongoConnectionString),
    ContactsModule,
    MessagesModule,
    ChatsModule,
    ImagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
