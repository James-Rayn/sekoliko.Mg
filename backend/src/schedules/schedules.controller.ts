import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('schedules')
export class SchedulesController {
  constructor(private schedulesService: SchedulesService) {}

  // POST /schedules → Créer un créneau
  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateScheduleDto) {
    return this.schedulesService.create(dto);
  }

  // GET /schedules → Tous les créneaux
  @Get()
  @Roles('ADMIN', 'TEACHER')
  findAll(@Query('classId') classId?: string) {
    return this.schedulesService.findAll(classId);
  }

  // GET /schedules/global → Vue globale
  @Get('global')
  @Roles('ADMIN')
  getGlobalView() {
    return this.schedulesService.getGlobalView();
  }

  // GET /schedules/class/:classId → EDT d'une classe
  @Get('class/:classId')
  @Roles('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  findByClass(@Param('classId') classId: string) {
    return this.schedulesService.findByClass(classId);
  }

  // GET /schedules/teacher/:teacherId → EDT d'un enseignant
  @Get('teacher/:teacherId')
  @Roles('ADMIN', 'TEACHER')
  findByTeacher(@Param('teacherId') teacherId: string) {
    return this.schedulesService.findByTeacher(teacherId);
  }

  // DELETE /schedules/:id → Supprimer un créneau
  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.schedulesService.remove(id);
  }
}