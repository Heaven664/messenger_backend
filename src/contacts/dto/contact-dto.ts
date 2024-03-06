import { IsEmail, IsNotEmpty } from 'class-validator';

export class AddContactDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsEmail()
  friendEmail: string;
}
