import { BadRequestException } from '@nestjs/common';
import { MulterOptionsFactory } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export default class MulterConfigService implements MulterOptionsFactory {
  createMulterOptions(): MulterOptions | Promise<MulterOptions> {
    return {
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = ['image/*', 'video/*'];

        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(`Invalid file type: ${file.mimetype}`),
            false,
          );
        }
      },
      dest: './uploads',
    };
  }
}
