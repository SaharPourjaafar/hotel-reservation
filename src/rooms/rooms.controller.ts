import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Delete,
  Patch,
  UseGuards,
  Query,
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
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/requestDto/create-room.dto';
import { UpdateRoomDto } from './dto/requestDto/update-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AvailableRoomDto } from './dto/requestDto/available-room.dto';
import { RoomResponseDto } from './dto/responseDto/room-response.dto';
import { RoomListResponseDto } from './dto/responseDto/room-list-response.dto';
import { FilterRoomDto } from './dto/requestDto/filter-room.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  @ApiOperation({ summary: 'Get rooms' })
  @ApiOkResponse({
    description: 'Rooms retrieved successfully',
    type: RoomListResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  findAll(@Query() filterDto: FilterRoomDto) {
    return this.roomsService.findAll(filterDto);
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available rooms' })
  @ApiOkResponse({
    description: 'Available rooms retrieved successfully',
    type: RoomResponseDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  findAvailableRooms(@Query() availableRoomDto: AvailableRoomDto) {
    return this.roomsService.findAvailableRooms(availableRoomDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room by id' })
  @ApiOkResponse({
    description: 'Room retrieved successfully',
    type: RoomResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    description: 'Room not found',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new room' })
  @ApiCreatedResponse({
    description: 'Room created successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid room data',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    description: 'Hotel not found',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async create(@Body() createRoomDto: CreateRoomDto): Promise<void> {
    await this.roomsService.create(createRoomDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update room' })
  @ApiOkResponse({
    description: 'Room updated successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid room data',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    description: 'Room or hotel not found',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomDto: UpdateRoomDto,
  ): Promise<void> {
    await this.roomsService.update(id, updateRoomDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete room' })
  @ApiOkResponse({
    description: 'Room deleted successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    description: 'Room not found',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.roomsService.remove(id);
  }
}
