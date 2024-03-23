import * as fs from 'fs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ImagesService {
  async getImage(imageUrl: string) {
    return `${process.cwd()}/files/avatars/${imageUrl}`;
  }

  async deleteImage(imageUrl: string) {
    const imagePath = `${process.cwd()}/files/avatars/${imageUrl}`;

    if (fs.existsSync(imagePath)) {
      // Check if the old image exists
      fs.unlinkSync(imagePath); // Delete the old image
    } else {
      console.log('Image does not exist');
    }
  }
}
