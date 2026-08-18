import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Reservation } from './entities/reservation.entity';
import { User } from '../users/entities/user.entity';
import { Room } from '../rooms/entities/room.entity';

import { CreateReservationDto } from './dto/requestDto/create-reservation.dto';
import { UpdateReservationDto } from './dto/requestDto/update-reservation.dto';
import { FilterReservationDto } from './dto/requestDto/filter-reservation.dto';

import { RoomStatus } from '../rooms/enums/room-status.enum';

import { ReservationSortField } from './enums/reservation-sortfield';

import { ReservationResponseDto } from './dto/responseDto/reservation-response.dto';
import { ReservationStatus } from './enums/reservation-status.enum';
import {
  getPagination,
  getPaginationMeta,
} from '../common/utils/pagination.utils';
import { DataSource } from 'typeorm';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationsRepository: Repository<Reservation>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Room)
    private readonly roomsRepository: Repository<Room>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createReservationDto: CreateReservationDto) {
    return this.dataSource.transaction(async (manager) => {
      const { userId, roomId, checkIn, checkOut, guestCount } =
        createReservationDto;

      // 1. پیدا کردن User
      const userRepository = manager.getRepository(User);

      const user = await userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // 2. پیدا کردن Room
      const roomRepository = manager.getRepository(Room);

      const room = await roomRepository.findOne({
        where: { id: roomId },
      });

      if (!room) {
        throw new NotFoundException('Room not found');
      }

      // 3. بررسی وضعیت اتاق
      if (room.status !== RoomStatus.AVAILABLE) {
        throw new BadRequestException('Room is not available');
      }

      // 4. تبدیل تاریخ‌ها
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      // 5. بررسی ترتیب تاریخ
      if (checkOutDate <= checkInDate) {
        throw new BadRequestException(
          'Check-out date must be after check-in date',
        );
      }

      // 6. بررسی گذشته نبودن Check-in
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkInDate < today) {
        throw new BadRequestException('Check-in date cannot be in the past');
      }

      // 7. بررسی ظرفیت
      if (guestCount > room.capacity) {
        throw new BadRequestException('Guest count exceeds room capacity');
      }

      // 8. بررسی تداخل رزرو
      const reservationRepository = manager.getRepository(Reservation);

      const overlappingReservation = await reservationRepository
        .createQueryBuilder('reservation')
        .where('reservation.roomId = :roomId', {
          roomId,
        })
        .andWhere('reservation.checkIn < :checkOut', {
          checkOut: checkOutDate,
        })
        .andWhere('reservation.checkOut > :checkIn', {
          checkIn: checkInDate,
        })
        .andWhere('reservation.status IN (:...statuses)', {
          statuses: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
        })
        .getOne();

      if (overlappingReservation) {
        throw new ConflictException('Room is already reserved for these dates');
      }

      // 9. محاسبه تعداد شب‌ها
      const millisecondsPerDay = 1000 * 60 * 60 * 24;

      const nights = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) / millisecondsPerDay,
      );

      // 10. محاسبه قیمت
      const totalPrice = nights * Number(room.price);

      // 11. ساخت Reservation
      const reservation = reservationRepository.create({
        user,
        room,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guestCount,
        status: ReservationStatus.PENDING,
        totalPrice,
      });

      // 12. ذخیره Reservation
      await reservationRepository.save(reservation);

      return;
    });
  }

  async findAll(filterDto: FilterReservationDto) {
    const query = this.reservationsRepository
      .createQueryBuilder('reservation')
      .leftJoin('reservation.user', 'user')
      .leftJoin('reservation.room', 'room')
      .select([
        'reservation.id',
        'reservation.checkIn',
        'reservation.checkOut',
        'reservation.guestCount',
        'reservation.status',
        'reservation.totalPrice',

        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',

        'room.id',
        'room.roomNumber',
        'room.type',
        'room.capacity',
        'room.price',
        'room.status',
      ]);

    // Filter by status
    if (filterDto.status) {
      query.andWhere('reservation.status = :status', {
        status: filterDto.status,
      });
    }

    // Filter by user
    if (filterDto.userId !== undefined) {
      query.andWhere('reservation.userId = :userId', {
        userId: filterDto.userId,
      });
    }

    // Filter by room
    if (filterDto.roomId !== undefined) {
      query.andWhere('reservation.roomId = :roomId', {
        roomId: filterDto.roomId,
      });
    }

    // Minimum total price
    if (filterDto.minTotalPrice !== undefined) {
      query.andWhere('reservation.totalPrice >= :minTotalPrice', {
        minTotalPrice: filterDto.minTotalPrice,
      });
    }

    // Maximum total price
    if (filterDto.maxTotalPrice !== undefined) {
      query.andWhere('reservation.totalPrice <= :maxTotalPrice', {
        maxTotalPrice: filterDto.maxTotalPrice,
      });
    }

    // Check-in filter
    if (filterDto.checkIn) {
      query.andWhere('reservation.checkIn >= :checkIn', {
        checkIn: filterDto.checkIn,
      });
    }

    // Check-out filter
    if (filterDto.checkOut) {
      query.andWhere('reservation.checkOut <= :checkOut', {
        checkOut: filterDto.checkOut,
      });
    }

    // Pagination
    const { page, limit, skip } = getPagination(
      filterDto.page,
      filterDto.limit,
    );
    // Sorting
    const sortBy = filterDto.sortBy ?? ReservationSortField.ID;

    const order = filterDto.order ?? 'ASC';

    query.orderBy(`reservation.${sortBy}`, order).skip(skip).take(limit);

    const [reservations, total] = await query.getManyAndCount();

    return {
      data: reservations.map((reservation) =>
        this.toReservationResponse(reservation),
      ),
      meta: getPaginationMeta(page, limit, total),
    };
  }

  async findOne(id: number): Promise<ReservationResponseDto> {
    const reservation = await this.reservationsRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.user', 'user')
      .leftJoinAndSelect('reservation.room', 'room')
      .leftJoinAndSelect('room.hotel', 'hotel')
      .where('reservation.id = :id', { id })
      .getOne();

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return this.toReservationResponse(reservation);
  }

  async update(id: number, updateReservationDto: UpdateReservationDto) {
    const reservation = await this.reservationsRepository.findOne({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (updateReservationDto.status !== undefined) {
      reservation.status = updateReservationDto.status;
    }

    await this.reservationsRepository.save(reservation);
  }

  private toReservationResponse(
    reservation: Reservation,
  ): ReservationResponseDto {
    return {
      id: reservation.id,

      checkIn: reservation.checkIn,

      checkOut: reservation.checkOut,

      guestCount: reservation.guestCount,

      status: reservation.status,

      totalPrice: Number(reservation.totalPrice),

      user: {
        id: reservation.user.id,
        firstName: reservation.user.firstName,
        lastName: reservation.user.lastName,
        email: reservation.user.email,
      },

      room: {
        id: reservation.room.id,
        roomNumber: reservation.room.roomNumber,
        type: reservation.room.type,
        capacity: reservation.room.capacity,
        price: Number(reservation.room.price),
        status: reservation.room.status,
      },
    };
  }
}
