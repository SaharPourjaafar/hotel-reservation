import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

import { HotelsService } from './hotels.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Query } from '@nestjs/common';
import { FilterHotelDto } from './dto/filter-hotel.dto';
import { HotelResponseDto } from './dto/responseDto/hotel-response.dto';
import { HotelListResponseDto } from './dto/responseDto/hotel-list-response.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('Hotels')
@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all hotels' })
  @ApiOkResponse({
    description: 'Hotels retrieved successfully',
    type: HotelListResponseDto,
  })
  findAll(@Query() filterDto: FilterHotelDto) {
    return this.hotelsService.findAll(filterDto);
  }
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  @Get(':id')
  @ApiOperation({ summary: 'Get hotel by id' })
  @ApiOkResponse({
    description: 'Hotel retrieved successfully',
    type: HotelResponseDto,
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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.hotelsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new hotel' })
  @ApiCreatedResponse({
    description: 'Hotel created successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request data',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiConflictResponse({
    description: 'Hotel already exists',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  create(@Body() createHotelDto: CreateHotelDto) {
    return this.hotelsService.create(createHotelDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update hotel' })
  @ApiOkResponse({
    description: 'Hotel updated successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request data',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    description: 'Hotel not found',
  })
  @ApiConflictResponse({
    description: 'Hotel already exists',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHotelDto: UpdateHotelDto,
  ) {
    return this.hotelsService.update(id, updateHotelDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete hotel' })
  @ApiOkResponse({
    description: 'Hotel deleted successfully',
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
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.hotelsService.remove(id);
  }
}
