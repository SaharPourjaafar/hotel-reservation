import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  StreamableFile,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/requestDto/create-user.dto';
import { UpdateUserDto } from './dto/requestDto/update-user.dto';
import { UserResponseDto } from './dto/responseDto/user-response.dto';
import { FilterUserDto } from './dto/requestDto/filter-user.dto';
import { UserListResponseDto } from './dto/responseDto/user-list-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateProfileDto } from './dto/requestDto/create-profile.dto';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get users' })
  @ApiOkResponse({
    description: 'Users retrieved successfully',
    type: UserListResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  findAll(@Query() filterDto: FilterUserDto) {
    return this.usersService.findAll(filterDto);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBadRequestResponse({
    description: 'Invalid user data',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiConflictResponse({
    description: 'Email already exists',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<void> {
    await this.usersService.create(createUserDto);
  }

  @Post('profile')
  @ApiOperation({ summary: 'Create or update user profile' })
  @ApiOkResponse({
    description: 'Profile updated successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Invalid profile data',
  })
  @ApiNotFoundResponse({
    description: 'User or file not found',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async createProfile(
    @CurrentUser() user: { id: number },
    @Body() createProfileDto: CreateProfileDto,
  ): Promise<User> {
    return this.usersService.createProfile(user.id, createProfileDto);
  }

  @Get(':id/avatar')
  @ApiOperation({ summary: 'Get user avatar' })
  @ApiOkResponse({
    description: 'User avatar',
    content: {
      'image/jpeg': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
      'image/png': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User or avatar not found',
  })
  async getAvatar(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StreamableFile> {
    const avatar = await this.usersService.getAvatar(id);

    return new StreamableFile(avatar.buffer, {
      type: avatar.mimeType,
      disposition: `inline; filename="${avatar.originalName}"`,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiOkResponse({
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid user ID',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiOkResponse({
    description: 'User updated successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid user data',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiConflictResponse({
    description: 'Email already exists',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<void> {
    await this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiOkResponse({
    description: 'User deleted successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid user ID',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.usersService.remove(id);
  }
}
