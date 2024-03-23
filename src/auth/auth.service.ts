import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, LoginUserDto } from 'src/shared/dto/create-user.dto';
import { UsersService } from './../users/users.service';
import { Injectable } from '@nestjs/common';
import { TOKEN_EXPIRATION_TIME } from 'lib/constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Delegate user registration to the UsersService
  async registerUser(userData: CreateUserDto) {
    return await this.usersService.registerNewUser(userData);
  }

  // Delegate user login to the UsersService
  async loginUser(userLoginData: LoginUserDto) {
    return await this.usersService.loginUser(userLoginData);
  }

  async refreshToken(user: any) {
    // Generate JWT payload
    const payload = {
      email: user.email,
      id: user.id,
    };

    // Return new tokens
    return {
      backendTokens: {
        accessToken: await this.jwtService.signAsync(payload, {
          expiresIn: '1h',
          secret: process.env.JWT_SECRET_KEY,
        }),
        refreshToken: await this.jwtService.signAsync(payload, {
          expiresIn: '7d',
          secret: process.env.JWT_REFRESH_TOKEN,
        }),
        expiresIn: new Date().setTime(
          new Date().getTime() + TOKEN_EXPIRATION_TIME,
        ),
      },
    };
  }
}
