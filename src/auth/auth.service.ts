import { CreateUserDto } from 'src/shared/dto/create-user.dto';
import { UsersService } from './../users/users.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async registerUser(userData: CreateUserDto) {
    return await this.usersService.registerNewUser(userData);
  }
}
