import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';

import { File, FileStatus } from './entities/file.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
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

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupTempFiles(): Promise<void> {
    const expirationTime = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const tempFiles = await this.fileRepository.find({
      where: {
        status: FileStatus.TEMP,
        createdAt: LessThan(expirationTime),
      },
    });

    for (const file of tempFiles) {
      const filePath = join(process.cwd(), file.path);

      try {
        await fs.unlink(filePath);
      } catch {
        // File may already be deleted
      }

      await this.fileRepository.remove(file);
    }
  }

  async getAvatar(fileId: number): Promise<{
    buffer: Buffer;
    mimeType: string;
    originalName: string;
  }> {
    const file = await this.fileRepository.findOne({
      where: {
        id: fileId,
        status: FileStatus.PERMANENT,
      },
    });

    if (!file) {
      throw new NotFoundException('Avatar file not found');
    }

    const filePath = join(process.cwd(), file.path);

    const buffer = await fs.readFile(filePath);

    return {
      buffer,
      mimeType: file.mimeType,
      originalName: file.originalName,
    };
  }
}
