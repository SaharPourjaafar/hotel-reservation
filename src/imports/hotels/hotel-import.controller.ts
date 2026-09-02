import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

import { HotelImportService } from './hotel-import.service';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('imports/hotels')
export class HotelImportController {
  constructor(private readonly hotelImportService: HotelImportService) {}

  @Public()
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  importHotels(@UploadedFile() file: Express.Multer.File) {
    return this.hotelImportService.readExcel(file.buffer);
  }
}
