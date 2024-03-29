import { Controller, Delete, Get, Param, Res } from '@nestjs/common';
import { ImagesService } from './images.service';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}
  @Get(':imageUrl')
  async getImage(@Param('imageUrl') imageUrl: string, @Res() res) {
    const image = await this.imagesService.getImage(imageUrl);
    return res.sendFile(image);
  }

  @Delete(':imageUrl')
  async deleteImage(@Param('imageUrl') imageUrl: string) {
    return this.imagesService.deleteImage(imageUrl);
  }
}
