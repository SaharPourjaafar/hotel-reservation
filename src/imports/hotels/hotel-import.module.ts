import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hotel } from '../../hotels/entities/hotel.entity';
import { HotelImportController } from './hotel-import.controller';
import { HotelImportService } from './hotel-import.service';

@Module({
  imports: [TypeOrmModule.forFeature([Hotel])],
  controllers: [HotelImportController],
  providers: [HotelImportService],
})
export class HotelImportModule {}
