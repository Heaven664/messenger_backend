import { UsersService } from './../users/users.service';
import { Injectable } from '@nestjs/common';
import { InitialUserData } from 'src/users/interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async registerUser(userData: InitialUserData) {
    return await this.usersService.create(userData);
  }
}
