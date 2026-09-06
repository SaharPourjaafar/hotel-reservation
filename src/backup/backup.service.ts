import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { readdirSync, statSync, unlinkSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { Cron } from '@nestjs/schedule';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  async createBackup() {
    try {
      const backupDir = join(process.cwd(), 'backups');

      // Create backups directory if it doesn't exist
      if (!existsSync(backupDir)) {
        mkdirSync(backupDir, { recursive: true });
      }

      // Create unique backup filename
      const timestamp = new Date()
        .toISOString()
        .replace(/:/g, '-')
        .replace(/\..+/, '');

      const backupFile = join(backupDir, `backup-${timestamp}.sql`);

      const mysqldumpPath =
        'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe';

      const command = `"${mysqldumpPath}" --login-path=backup hotel_reservation > "${backupFile}"`;
      await execAsync(command);

      this.deleteOldBackups();

      return {
        message: 'Database backup created successfully',
        file: backupFile,
      };
    } catch {
      throw new InternalServerErrorException(
        'Failed to create database backup',
      );
    }
  }

  @Cron('0 10 * * *')
  async handleAutomaticBackup() {
    await this.createBackup();
  }
  private deleteOldBackups() {
    const backupDir = join(process.cwd(), 'backups');

    if (!existsSync(backupDir)) {
      return;
    }

    const retentionDays = 30;

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - retentionDays);

    const files = readdirSync(backupDir);

    for (const file of files) {
      if (!file.endsWith('.sql')) {
        continue;
      }

      const filePath = join(backupDir, file);
      const fileStats = statSync(filePath);

      if (fileStats.mtime < expirationDate) {
        unlinkSync(filePath);
      }
    }
  }
}
