import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';

export const multerOptions: MulterOptions = {
  storage: diskStorage({
    destination: './files/avatars',
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
};
