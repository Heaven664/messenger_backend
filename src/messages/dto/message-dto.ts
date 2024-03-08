import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddMessageDto {
  @IsNotEmpty()
  @IsString()
  senderEmail: string;

  @IsNotEmpty()
  @IsString()
  receiverEmail: string;

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

export class GetMessageDto {
  @IsNotEmpty()
  @IsString()
  userEmail: string;

  @IsNotEmpty()
  @IsString()
  friendEmail: string;
}
