import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import fs from 'fs';
import { diskStorage } from 'multer';
import path, { join } from 'path';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  getRootPath = () => {
    return process.cwd();
  };

  createMulterOptions(): MulterModuleOptions {
    return {
        storage: diskStorage({
            destination: (req, file, cb) => {
                cb(null, join(this.getRootPath(), `public/images`))
            },
            filename: (req, file, cb) => {
                //get image extension
                let extName = path.extname(file.originalname);
                //get image's name (without extension)
                let baseName = path.basename(file.originalname, extName);
                let finalName = `${baseName}-${Date.now()}${extName}`
                cb(null, finalName)
            },
        }),
        fileFilter: (req, file, cb) => {
            const allowedFileTypes = ['jpg', 'jpeg', 'png'];
            const fileExtension = file.originalname.split('.').pop().toLowerCase();
            const isValidFileType = allowedFileTypes.includes(fileExtension);
            if (!isValidFileType) {
                cb(new HttpException('Invalid file type', HttpStatus.UNPROCESSABLE_ENTITY), null);
            } else
                cb(null, true);
        }, 
        limits: {
            fileSize: 1024 * 1024 * 5 // 5MB
        }
    };
}
}
