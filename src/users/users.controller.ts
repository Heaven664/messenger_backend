import { UsersService } from './users.service';
import {
  Controller,
  Param,
  Get,
  Put,
  Body,
  UseInterceptors,
  Post,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { UserWithoutPassword } from 'src/users/interfaces/user.interface';
import { UpdateLastSeenDto, UpdateUserInfoDto } from './dto/user-dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FOUR_MB_IN_BYTES } from 'lib/constants';
import { multerOptions } from './lib/multer.config';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserWithoutPassword> {
    return this.usersService.findUserById(id);
  }

  @Put('info')
  async updateInfo(
    @Body() updateInfo: UpdateUserInfoDto,
  ): Promise<UserWithoutPassword> {
    return this.usersService.updateUserInfo(updateInfo);
  }

  @UseGuards(JwtGuard)
  @Put('last-seen')
  async updateLastSeen(
    @Body() updateLastSeenDto: UpdateLastSeenDto,
    @Req() req,
  ): Promise<UserWithoutPassword> {
    const { id } = updateLastSeenDto;
    const { id: userJwtId, email } = req?.user;

    // If provided id does not match with the user id in the token, throw an error
    if (id !== userJwtId)
      throw new UnauthorizedException('Can not recognize user');

    return this.usersService.updateLastSeenPermission({
      lastSeenPermission: updateLastSeenDto.lastSeenPermission,
      id,
      email,
    });
  }

  @UseGuards(JwtGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('profileImage', multerOptions))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: FOUR_MB_IN_BYTES }),
          new FileTypeValidator({ fileType: /image.(png|jpeg|heic|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() req,
  ) {
    const { email } = req.user;
    const updatedImagePath = `http://localhost:3001/images/${file.filename}`;
    await this.usersService.updateUserAvatar(email, updatedImagePath);
    return file.filename;
  }
}
