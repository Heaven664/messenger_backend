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
} from '@nestjs/common';
import { UserWithoutPassword } from 'src/users/interfaces/user.interface';
import { UpdateLastSeenDto, UpdateUserInfoDto } from './dto/user-dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FOUR_MB_IN_BYTES } from 'lib/constants';
import { multerOptions } from './lib/multer.config';

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

  @Put('last-seen')
  async updateLastSeen(
    @Body() updateLastSeenDto: UpdateLastSeenDto,
  ): Promise<UserWithoutPassword> {
    return this.usersService.updateLastSeenPermission(updateLastSeenDto);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('profileImage', multerOptions))
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: FOUR_MB_IN_BYTES }),
          new FileTypeValidator({ fileType: /\.(png|jpeg|heic|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    console.log(file);
  }
}
