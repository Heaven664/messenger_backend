import { IsBoolean, IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateChatDto {
  @IsNotEmpty()
  @IsEmail()
  userEmail: string;

  @IsNotEmpty()
  @IsEmail()
  friendEmail: string;

  @IsNotEmpty()
  @IsNotEmpty()
  friendImage: string;

  @IsNotEmpty()
  @IsNumber()
  lastMessage: number;

  @IsNotEmpty()
  @IsBoolean()
  lastSeenPermission: boolean;

  @IsNotEmpty()
  @IsNumber()
  lastSeenTime: number;
}
