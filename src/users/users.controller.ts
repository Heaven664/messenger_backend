import { UsersService } from './users.service';
import { Controller, Param, Get } from '@nestjs/common';
import { UserWithoutPassword } from 'src/users/interfaces/user.interface';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserWithoutPassword> {
    return this.usersService.findUserById(id);
  }
}
