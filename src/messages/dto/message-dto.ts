import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddMessageDto {
  @IsNotEmpty()
  @IsString()
  senderId: string;

  @IsNotEmpty()
  @IsString()
  receiverId: string;

  @IsNotEmpty()
  @IsString()
  messageBody: string;

  @IsNotEmpty()
  @IsString()
  senderImageUrl: string;

  @IsNotEmpty()
  @IsNumber()
  sentTime: number;
}
