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
import { CancellationRequest } from './entities/cancellation-request.entity';
import { CancellationRequestStatus } from './enums/cancellation-request-status.enum';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationsRepository: Repository<Reservation>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Room)
    private readonly roomsRepository: Repository<Room>,

    @InjectRepository(CancellationRequest)
    private readonly cancellationRequestsRepository: Repository<CancellationRequest>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createReservationDto: CreateReservationDto, userId: number) {
    return this.dataSource.transaction(async (manager) => {
      const { rooms, checkIn, checkOut } = createReservationDto;

      // 1. پیدا کردن User
      const userRepository = manager.getRepository(User);

      const user = await userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // 2. تبدیل تاریخ‌ها
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      // 3. بررسی ترتیب تاریخ
      if (checkOutDate <= checkInDate) {
        throw new BadRequestException(
          'Check-out date must be after check-in date',
        );
      }

      // 4. بررسی گذشته نبودن Check-in
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkInDate < today) {
        throw new BadRequestException('Check-in date cannot be in the past');
      }

      // 5. محاسبه تعداد شب‌ها
      const millisecondsPerDay = 1000 * 60 * 60 * 24;

      const nights = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) / millisecondsPerDay,
      );

      const roomRepository = manager.getRepository(Room);
      const reservationRepository = manager.getRepository(Reservation);

      const reservations: Reservation[] = [];

      // 6. بررسی و ساخت Reservation برای هر اتاق
      for (const requestedRoom of rooms) {
        // پیدا کردن Room
        const room = await roomRepository.findOne({
          where: { id: requestedRoom.roomId },
        });

        if (!room) {
          throw new NotFoundException(`Room ${requestedRoom.roomId} not found`);
        }

        // بررسی وضعیت اتاق
        if (room.status !== RoomStatus.AVAILABLE) {
          throw new BadRequestException(
            `Room ${room.roomNumber} is not available`,
          );
        }

        // بررسی ظرفیت
        if (requestedRoom.guestCount > room.capacity) {
          throw new BadRequestException(
            `Guest count exceeds room capacity for room ${room.roomNumber}`,
          );
        }

        // بررسی تداخل رزرو
        const overlappingReservation = await reservationRepository
          .createQueryBuilder('reservation')
          .where('reservation.roomId = :roomId', {
            roomId: room.id,
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
          throw new ConflictException(
            `Room ${room.roomNumber} is already reserved for these dates`,
          );
        }

        // محاسبه قیمت این اتاق
        const totalPrice = nights * Number(room.price);

        // ساخت Reservation
        const reservation = reservationRepository.create({
          user,
          room,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guestCount: requestedRoom.guestCount,
          status: ReservationStatus.PENDING,
          totalPrice,
        });

        reservations.push(reservation);
      }

      // 7. ذخیره تمام Reservationها
      await reservationRepository.save(reservations);

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
  async createCancellationRequest(reservationId: number, userId: number) {
    const reservation = await this.reservationsRepository.findOne({
      where: {
        id: reservationId,
        user: {
          id: userId,
        },
      },
    });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (
      reservation.status !== ReservationStatus.PENDING &&
      reservation.status !== ReservationStatus.CONFIRMED
    ) {
      throw new BadRequestException('This reservation cannot be cancelled');
    }

    const existingRequest = await this.cancellationRequestsRepository.findOne({
      where: {
        reservation: {
          id: reservationId,
        },
        status: CancellationRequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new ConflictException('A cancellation request is already pending');
    }

    const cancellationRequest = this.cancellationRequestsRepository.create({
      user: {
        id: userId,
      },
      reservation,
      status: CancellationRequestStatus.PENDING,
    });

    await this.cancellationRequestsRepository.save(cancellationRequest);
  }

  async findCancellationRequests() {
    return this.cancellationRequestsRepository.find({
      relations: {
        user: true,
        reservation: true,
      },
    });
  }

  async approveCancellationRequest(id: number) {
    const cancellationRequest =
      await this.cancellationRequestsRepository.findOne({
        where: { id },
        relations: {
          reservation: true,
        },
      });

    if (!cancellationRequest) {
      throw new NotFoundException('Cancellation request not found');
    }

    if (cancellationRequest.status !== CancellationRequestStatus.PENDING) {
      throw new BadRequestException(
        'Cancellation request has already been processed',
      );
    }

    await this.dataSource.transaction(async (manager) => {
      cancellationRequest.status = CancellationRequestStatus.APPROVED;

      cancellationRequest.reservation.status = ReservationStatus.CANCELLED;

      await manager.save(cancellationRequest);
      await manager.save(cancellationRequest.reservation);
    });
  }

  async rejectCancellationRequest(id: number) {
    const cancellationRequest =
      await this.cancellationRequestsRepository.findOne({
        where: { id },
      });

    if (!cancellationRequest) {
      throw new NotFoundException('Cancellation request not found');
    }

    if (cancellationRequest.status !== CancellationRequestStatus.PENDING) {
      throw new BadRequestException(
        'Cancellation request has already been processed',
      );
    }

    cancellationRequest.status = CancellationRequestStatus.REJECTED;

    await this.cancellationRequestsRepository.save(cancellationRequest);
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
