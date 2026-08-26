import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { Reservation } from './entities/reservation.entity';
import { User } from '../users/entities/user.entity';
import { Room } from '../rooms/entities/room.entity';
import { CancellationRequest } from './entities/cancellation-request.entity';
import { ReservationRoom } from './entities/reservation-room.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reservation,
      ReservationRoom,
      User,
      Room,
      CancellationRequest,
    ]),
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}
