import { UsersService } from './users.service';
import { Controller, Param, Get, Put, Body } from '@nestjs/common';
import { UserWithoutPassword } from 'src/users/interfaces/user.interface';
import { UpdateUserInfoDto } from './dto/user-dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserWithoutPassword> {
    return this.usersService.findUserById(id);
  }

  @Put('info')
  async updateInfo(
    @Body() updateUserDto: UpdateUserInfoDto,
  ): Promise<UserWithoutPassword> {
    return this.usersService.updateUserInfo(updateUserDto);
  }
}
