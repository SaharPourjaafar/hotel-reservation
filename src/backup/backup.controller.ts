import { Controller, Post } from '@nestjs/common';
import { BackupService } from './backup.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Post()
  createBackup() {
    return this.backupService.createBackup();
  }
}
