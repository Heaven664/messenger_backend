import { Injectable } from '@nestjs/common';

@Injectable()
export class ImagesService {
  async getImage(imageUrl: string) {
    return `${process.cwd()}/files/avatars/${imageUrl}`;
  }
}
