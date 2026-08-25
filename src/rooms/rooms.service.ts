import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';

import { Room } from './entities/room.entity';
import { Hotel } from '../hotels/entities/hotel.entity';

import { CreateRoomDto } from './dto/requestDto/create-room.dto';
import { UpdateRoomDto } from './dto/requestDto/update-room.dto';
import { AvailableRoomDto } from './dto/requestDto/available-room.dto';
import { ReservationStatus } from '../reservations/enums/reservation-status.enum';
import { RoomResponseDto } from './dto/responseDto/room-response.dto';
import { FilterRoomDto } from './dto/requestDto/filter-room.dto';
import {
  getPagination,
  getPaginationMeta,
} from '../common/utils/pagination.utils';
import { RoomSortField } from './enums/room-sortfield.enum';
import { SortOrder } from './enums/room-sortorder.enum';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomsRepository: Repository<Room>,

    @InjectRepository(Hotel)
    private readonly hotelsRepository: Repository<Hotel>,
  ) {}

  async findAll(filterDto: FilterRoomDto) {
    const query = this.roomsRepository
      .createQueryBuilder('room')
      .leftJoin('room.hotel', 'hotel')
      .select([
        'room.id',
        'room.roomNumber',
        'room.type',
        'room.capacity',
        'room.price',
        'room.status',
        'hotel.id',
      ]);

    if (filterDto.search) {
      query.andWhere('room.roomNumber LIKE :search', {
        search: `%${filterDto.search}%`,
      });
    }

    if (filterDto.hotelId !== undefined) {
      query.andWhere('room.hotelId = :hotelId', {
        hotelId: filterDto.hotelId,
      });
    }

    if (filterDto.type) {
      query.andWhere('room.type = :type', {
        type: filterDto.type,
      });
    }

    if (filterDto.status) {
      query.andWhere('room.status = :status', {
        status: filterDto.status,
      });
    }

    if (filterDto.minPrice !== undefined) {
      query.andWhere('room.price >= :minPrice', {
        minPrice: filterDto.minPrice,
      });
    }

    if (filterDto.maxPrice !== undefined) {
      query.andWhere('room.price <= :maxPrice', {
        maxPrice: filterDto.maxPrice,
      });
    }

    if (filterDto.minCapacity !== undefined) {
      query.andWhere('room.capacity >= :minCapacity', {
        minCapacity: filterDto.minCapacity,
      });
    }
    const { page, limit, skip } = getPagination(
      filterDto.page,
      filterDto.limit,
    );

    const sortBy = filterDto.sortBy ?? RoomSortField.ID;
    const order = filterDto.order ?? SortOrder.ASC;

    query.orderBy(`room.${sortBy}`, order).skip(skip).take(limit);

    const [rooms, total] = await query.getManyAndCount();

    return {
      data: rooms.map((room) => this.toRoomResponse(room)),
      meta: getPaginationMeta(page, limit, total),
    };
  }

  async findAvailableRooms(availableRoomDto: AvailableRoomDto) {
    const query = this.roomsRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.hotel', 'hotel');
    if (availableRoomDto.minPrice !== undefined) {
      query.andWhere('room.price >= :minPrice', {
        minPrice: availableRoomDto.minPrice,
      });
    }

    if (availableRoomDto.maxPrice !== undefined) {
      query.andWhere('room.price <= :maxPrice', {
        maxPrice: availableRoomDto.maxPrice,
      });
    }

    if (availableRoomDto.type) {
      query.andWhere('room.type = :type', {
        type: availableRoomDto.type,
      });
    }

    if (availableRoomDto.capacity !== undefined) {
      query.andWhere('room.capacity >= :capacity', {
        capacity: availableRoomDto.capacity,
      });
    }

    const checkIn = new Date(availableRoomDto.checkIn);
    const checkOut = new Date(availableRoomDto.checkOut);

    query.andWhere(
      `
    NOT EXISTS (
      SELECT 1
      FROM reservation reservation
      WHERE reservation.roomId = room.id
        AND reservation.checkIn < :checkOut
        AND reservation.checkOut > :checkIn
        AND reservation.status IN (:...statuses)
    )
    `,
      {
        checkIn,
        checkOut,
        statuses: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
      },
    );

    const rooms = await query.getMany();

    return rooms.map((room) => this.toRoomResponse(room));
  }

  async findOne(id: number): Promise<RoomResponseDto> {
    const room = await this.roomsRepository.findOne({
      where: { id },
      relations: {
        hotel: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return this.toRoomResponse(room);
  }

  async create(createRoomDto: CreateRoomDto) {
    const hotel = await this.hotelsRepository.findOne({
      where: {
        id: createRoomDto.hotelId,
      },
    });

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    const room = this.roomsRepository.create({
      roomNumber: createRoomDto.roomNumber,
      type: createRoomDto.type,
      capacity: createRoomDto.capacity,
      price: createRoomDto.price,
      status: createRoomDto.status,
      hotel,
    });

    await this.roomsRepository.save(room);
  }

  async update(id: number, updateRoomDto: UpdateRoomDto) {
    const room = await this.roomsRepository.findOne({
      where: { id },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (updateRoomDto.hotelId !== undefined) {
      const hotel = await this.hotelsRepository.findOne({
        where: {
          id: updateRoomDto.hotelId,
        },
      });

      if (!hotel) {
        throw new NotFoundException('Hotel not found');
      }

      room.hotel = hotel;
    }

    if (updateRoomDto.roomNumber !== undefined) {
      room.roomNumber = updateRoomDto.roomNumber;
    }

    if (updateRoomDto.type !== undefined) {
      room.type = updateRoomDto.type;
    }

    if (updateRoomDto.capacity !== undefined) {
      room.capacity = updateRoomDto.capacity;
    }

    if (updateRoomDto.price !== undefined) {
      room.price = updateRoomDto.price;
    }

    if (updateRoomDto.status !== undefined) {
      room.status = updateRoomDto.status;
    }

    await this.roomsRepository.save(room);
  }

  async remove(id: number) {
    const room = await this.roomsRepository.findOne({
      where: { id },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    try {
      await this.roomsRepository.delete(id);
    } catch (error: unknown) {
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as { errno?: number };

        if (driverError.errno === 1451) {
          throw new ConflictException(
            'Cannot delete room because it has reservations',
          );
        }
      }

      throw error;
    }
  }

  private toRoomResponse(room: Room): RoomResponseDto {
    return {
      id: room.id,
      roomNumber: room.roomNumber,
      type: room.type,
      capacity: room.capacity,
      price: room.price,
      status: room.status,
      hotelId: room.hotel.id,
    };
  }
}
