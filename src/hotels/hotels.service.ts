import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel } from './entities/hotel.entity';
import { CreateHotelDto } from './dto/requestDto/create-hotel.dto';
import { UpdateHotelDto } from './dto/requestDto/update-hotel.dto';
import { FilterHotelDto } from './dto/requestDto/filter-hotel.dto';
import { HotelSortField } from './enums/hotel-sort-field.enum';
import { HotelResponseDto } from './dto/responseDto/hotel-response.dto';

@Injectable()
export class HotelsService {
  constructor(
    @InjectRepository(Hotel)
    private readonly hotelsRepository: Repository<Hotel>,
  ) {}

  async getPaginatedHotels(filterDto: FilterHotelDto) {
    const query = this.hotelsRepository.createQueryBuilder('hotel');

    if (filterDto.search) {
      query.andWhere(
        '(hotel.name LIKE :search OR hotel.description LIKE :search)',
        {
          search: `%${filterDto.search}%`,
        },
      );
    }

    // Filter by city
    if (filterDto.city) {
      query.andWhere('hotel.city = :city', {
        city: filterDto.city,
      });
    }

    // Filter by star
    if (filterDto.minStar !== undefined) {
      query.andWhere('hotel.star >= :minStar', {
        minStar: filterDto.minStar,
      });
    }

    if (filterDto.maxStar !== undefined) {
      query.andWhere('hotel.star <= :maxStar', {
        maxStar: filterDto.maxStar,
      });
    }

    // Pagination
    const page = filterDto.page ?? 1;
    const limit = filterDto.limit ?? 10;

    const skip = (page - 1) * limit;

    // Sort
    const sortBy = filterDto.sortBy ?? HotelSortField.ID;
    const order = filterDto.order ?? 'ASC';

    query.orderBy(`hotel.${sortBy}`, order).skip(skip).take(limit);

    // Get data + total count
    const [hotels, total] = await query.getManyAndCount();

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return {
      data: hotels.map((hotel) => this.toHotelResponse(hotel)),

      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findOne(id: number): Promise<HotelResponseDto> {
    const hotel = await this.hotelsRepository.findOne({
      where: { id },
    });

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }
    return this.toHotelResponse(hotel);
  }

  async create(createHotelDto: CreateHotelDto) {
    const hotel = this.hotelsRepository.create(createHotelDto);

    await this.hotelsRepository.save(hotel);
  }

  async update(id: number, updateHotelDto: UpdateHotelDto) {
    const hotel = await this.hotelsRepository.preload({
      id,
      ...updateHotelDto,
    });

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    await this.hotelsRepository.save(hotel);
  }

  async remove(id: number) {
    const result = await this.hotelsRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Hotel not found');
    }
  }
  private toHotelResponse(hotel: Hotel): HotelResponseDto {
    return {
      id: hotel.id,
      name: hotel.name,
      description: hotel.description,
      address: hotel.address,
      city: hotel.city,
      star: hotel.star,
    };
  }
}
