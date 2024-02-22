import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserWithoutPassword } from 'src/users/interfaces/user.interface';
import { CreateUserDto, LoginUserDto } from 'src/shared/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserWithoutPassword> {
    return this.authService.registerUser(createUserDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }
}
