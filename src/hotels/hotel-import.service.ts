import { BadRequestException, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Hotel } from './entities/hotel.entity';

@Injectable()
export class HotelImportService {
  constructor(
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
    private readonly dataSource: DataSource,
  ) {}
  readExcel(file: Buffer) {
    const workbook = XLSX.read(file, {
      type: 'buffer',
    });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(worksheet);
    this.validateRows(data);

    return this.saveHotels(data);
  }

  private validateRows(data: unknown[]) {
    data.forEach((row, index) => {
      if (typeof row !== 'object' || row === null) {
        throw new BadRequestException(`Row ${index + 2} is invalid`);
      }

      const hotel = row as Record<string, unknown>;

      if (typeof hotel.name !== 'string' || hotel.name.trim() === '') {
        throw new BadRequestException(`Row ${index + 2}: name is required`);
      }

      if (
        typeof hotel.description !== 'string' ||
        hotel.description.trim() === ''
      ) {
        throw new BadRequestException(
          `Row ${index + 2}: description is required`,
        );
      }

      if (typeof hotel.address !== 'string' || hotel.address.trim() === '') {
        throw new BadRequestException(`Row ${index + 2}: address is required`);
      }

      if (typeof hotel.city !== 'string' || hotel.city.trim() === '') {
        throw new BadRequestException(`Row ${index + 2}: city is required`);
      }

      if (
        typeof hotel.star !== 'number' ||
        !Number.isInteger(hotel.star) ||
        hotel.star < 1 ||
        hotel.star > 5
      ) {
        throw new BadRequestException(
          `Row ${index + 2}: star must be an integer between 1 and 5`,
        );
      }
    });
  }
  private async saveHotels(data: unknown[]) {
    return this.dataSource.transaction(async (manager) => {
      const hotels = data.map((row) => {
        const hotel = row as Record<string, unknown>;

        return manager.create(Hotel, {
          name: hotel.name as string,
          description: hotel.description as string,
          address: hotel.address as string,
          city: hotel.city as string,
          star: hotel.star as number,
        });
      });

      return manager.save(Hotel, hotels);
    });
  }
}
