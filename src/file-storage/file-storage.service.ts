import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { File, FileStatus } from './entities/file.entity';

import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class FileStorageService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {}

  async saveTemp(file: Express.Multer.File): Promise<File> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const savedFile = this.fileRepository.create({
      originalName: file.originalname,
      fileName: file.filename,
      path: file.path,
      mimeType: file.mimetype,
      size: file.size,
      status: FileStatus.TEMP,
    });

    return this.fileRepository.save(savedFile);
  }

  async moveToPermanent(
    fileId: number,
    folder: 'profiles' | 'rooms',
  ): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: {
        id: fileId,
        status: FileStatus.TEMP,
      },
    });

    if (!file) {
      throw new NotFoundException('Temporary file not found');
    }

    const permanentDirectory = join(process.cwd(), 'uploads', folder);

    await fs.mkdir(permanentDirectory, {
      recursive: true,
    });

    const oldPath = join(process.cwd(), file.path);

    const newPath = join(permanentDirectory, file.fileName);

    await fs.rename(oldPath, newPath);

    file.path = join('uploads', folder, file.fileName);

    file.status = FileStatus.PERMANENT;

    return this.fileRepository.save(file);
  }
}
