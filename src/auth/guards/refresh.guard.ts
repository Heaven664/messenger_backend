import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class RefreshJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  // Check if user is authenticated
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Extract request object from the Execution Context
    const request = context.switchToHttp().getRequest();
    // Extract access token from request header
    const token = this.extractTokenFromHeader(request);
    // If token is not found, throw an error
    if (!token) throw new UnauthorizedException();
    try {
      // Verify token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_TOKEN,
      });
      // Attach payload data to request object
      request['user'] = payload;
    } catch {
      // Throw error if token is invalid
      throw new UnauthorizedException();
    }
    // Return true if user is authenticated
    return true;
  }

  // Extract refresh token from request header
  private extractTokenFromHeader(request: Request) {
    // Extract token data from authorization header
    const [type, token] = request.headers.authorization?.split(' ') || [];
    // Return token if type is Refresh
    return type === 'Refresh' ? token : undefined;
  }
}
