import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

import { ReservationsService } from './reservations.service';

import { CreateReservationDto } from './dto/requestDto/create-reservation.dto';
import { UpdateReservationDto } from './dto/requestDto/update-reservation.dto';
import { FilterReservationDto } from './dto/requestDto/filter-reservation.dto';

import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/enums/user-role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { ReservationResponseDto } from './dto/responseDto/reservation-response.dto';
import { ReservationListResponseDto } from './dto/responseDto/reservation-list-response.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('Reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new reservation',
  })
  @ApiCreatedResponse({
    description: 'Reservation created successfully',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid dates, room unavailable, or guest count exceeds room capacity',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    description: 'User or room not found',
  })
  @ApiConflictResponse({
    description: 'Room is already reserved for these dates',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async create(
    @Body() createReservationDto: CreateReservationDto,
  ): Promise<void> {
    await this.reservationsService.create(createReservationDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all reservations',
  })
  @ApiOkResponse({
    description: 'Reservations retrieved successfully',
    type: ReservationListResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  findAll(@Query() filterDto: FilterReservationDto) {
    return this.reservationsService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get reservation by id',
  })
  @ApiOkResponse({
    description: 'Reservation retrieved successfully',
    type: ReservationResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    description: 'Reservation not found',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Update reservation status',
  })
  @ApiOkResponse({
    description: 'Reservation updated successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid reservation status',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    description: 'Reservation not found',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReservationDto: UpdateReservationDto,
  ): Promise<void> {
    await this.reservationsService.update(id, updateReservationDto);
  }
}
