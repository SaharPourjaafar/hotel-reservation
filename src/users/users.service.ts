import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/requestDto/update-user.dto';
import { UserResponseDto } from './dto/responseDto/user-response.dto';
import { FilterUserDto, UserSortField } from './dto/requestDto/filter-user.dto';
import {
  getPagination,
  getPaginationMeta,
} from '../common/utils/pagination.utils';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(filterDto: FilterUserDto) {
    const query = this.usersRepository.createQueryBuilder('user');

    if (filterDto.search) {
      query.andWhere(
        '(user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search)',
        {
          search: `%${filterDto.search}%`,
        },
      );
    }

    if (filterDto.role) {
      query.andWhere('user.role = :role', {
        role: filterDto.role,
      });
    }

    const { page, limit, skip } = getPagination(
      filterDto.page,
      filterDto.limit,
    );

    const sortBy = filterDto.sortBy ?? UserSortField.ID;
    const order = filterDto.order ?? 'ASC';

    query.orderBy(`user.${sortBy}`, order).skip(skip).take(limit);

    const [users, total] = await query.getManyAndCount();

    return {
      data: users.map((user) => this.toUserResponse(user)),
      meta: getPaginationMeta(page, limit, total),
    };
  }
  async create(data: Partial<User>): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = this.usersRepository.create(data);

    if (data.password) {
      user.password = await bcrypt.hash(data.password, 10);
    }

    return this.usersRepository.save(user);
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toUserResponse(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.preload({
      id,
      ...updateUserDto,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      await this.usersRepository.delete(id);
    } catch (error: unknown) {
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as { errno?: number };

        if (driverError.errno === 1451) {
          throw new ConflictException(
            'Cannot delete user because the user has existing reservations.',
          );
        }
      }

      throw error;
    }
  }

  async findByEmail(email: string) {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  private toUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
