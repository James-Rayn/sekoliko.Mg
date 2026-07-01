import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  // POST /attendance → Marquer un élève
  @Post()
  @Roles('TEACHER', 'ADMIN')
  create(
    @Body() dto: CreateAttendanceDto,
    @CurrentUser() user: any,
  ) {
    return this.attendanceService.create(dto, user.id);
  }

  // POST /attendance/bulk → Faire l'appel d'une classe entière
  @Post('bulk')
  @Roles('TEACHER', 'ADMIN')
  createBulk(
    @Body() dto: BulkAttendanceDto,
    @CurrentUser() user: any,
  ) {
    return this.attendanceService.createBulk(
      dto,
      user.id,
    );
  }

  // GET /attendance/today/absents → Absents aujourd'hui
  @Get('today/absents')
  @Roles('ADMIN')
  getAbsentToday() {
    return this.attendanceService.getAbsentToday();
  }

  // GET /attendance/student/:id → Présences d'un élève
  @Get('student/:id')
  @Roles('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  findByStudent(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.findByStudent(id, {
      startDate,
      endDate,
    });
  }

  // GET /attendance/class/:classId?date=2024-11-15 → Appel du jour
  @Get('class/:classId')
  @Roles('ADMIN', 'TEACHER')
  findByClassAndDate(
    @Param('classId') classId: string,
    @Query('date') date: string,
  ) {
    return this.attendanceService.findByClassAndDate(classId, date);
  }

  // GET /attendance/class/:classId/stats → Stats d'assiduité
  @Get('class/:classId/stats')
  @Roles('ADMIN', 'TEACHER')
  getClassStats(
    @Param('classId') classId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.attendanceService.getClassStats(
      classId,
      startDate,
      endDate,
    );
  }

  // PATCH /attendance/:id → Modifier une présence
  @Patch(':id')
  @Roles('ADMIN', 'TEACHER')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(id, dto);
  }

  // PATCH /attendance/:id/justify → Justifier une absence
  @Patch(':id/justify')
  @Roles('ADMIN')
  justify(
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    return this.attendanceService.justify(id, body.reason);
  }
}