import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.237ozrg.mongodb.net/main/?retryWrites=true&w=majority`,
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
