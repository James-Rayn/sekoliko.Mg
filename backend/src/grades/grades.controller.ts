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
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('grades')
export class GradesController {
  constructor(private gradesService: GradesService) {}

  // POST /grades → Saisir une note
  @Post()
  @Roles('TEACHER', 'ADMIN')
  create(
    @Body() dto: CreateGradeDto,
    @CurrentUser() user: any,
  ) {
    return this.gradesService.create(dto, user.teacher?.id ?? user.id);
  }

  // POST /grades/bulk → Saisir plusieurs notes en même temps
  @Post('bulk')
  @Roles('TEACHER', 'ADMIN')
  createBulk(
    @Body() body: { grades: CreateGradeDto[] },
    @CurrentUser() user: any,
  ) {
    return this.gradesService.createBulk(
      body.grades,
      user.teacher?.id ?? user.id,
    );
  }

  // GET /grades/student/:id → Notes d'un élève
  @Get('student/:id')
  @Roles('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  findByStudent(
    @Param('id') id: string,
    @Query('period') period?: string,
    @Query('academicYear') academicYear?: string,
  ) {
    return this.gradesService.findByStudent(id, {
      period: period ? parseInt(period) : undefined,
      academicYear,
    });
  }

  // GET /grades/class/:classId/subject/:subjectId → Notes d'une classe
  @Get('class/:classId/subject/:subjectId')
  @Roles('ADMIN', 'TEACHER')
  findByClass(
    @Param('classId') classId: string,
    @Param('subjectId') subjectId: string,
    @Query('academicYear') academicYear: string,
  ) {
    return this.gradesService.findByClass(classId, subjectId, academicYear);
  }

  // GET /grades/average/:studentId → Moyenne d'un élève
  @Get('average/:studentId')
  @Roles('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  getAverage(
    @Param('studentId') studentId: string,
    @Query('period') period: string,
    @Query('academicYear') academicYear: string,
  ) {
    return this.gradesService.calculateAverage(
      studentId,
      parseInt(period),
      academicYear,
    );
  }

  // GET /grades/bulletin/:studentId → Bulletin complet
  @Get('bulletin/:studentId')
  @Roles('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  getBulletin(
    @Param('studentId') studentId: string,
    @Query('period') period: string,
    @Query('academicYear') academicYear: string,
  ) {
    return this.gradesService.getBulletin(
      studentId,
      parseInt(period),
      academicYear,
    );
  }

  // GET /grades/class/:classId/stats → Stats d'une classe
  @Get('class/:classId/stats')
  @Roles('ADMIN', 'TEACHER')
  getClassStats(
    @Param('classId') classId: string,
    @Query('academicYear') academicYear: string,
  ) {
    return this.gradesService.getClassStats(classId, academicYear);
  }

  // PATCH /grades/:id → Modifier une note
  @Patch(':id')
  @Roles('TEACHER', 'ADMIN')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGradeDto,
    @CurrentUser() user: any,
  ) {
    return this.gradesService.update(id, dto, user.teacher?.id ?? user.id);
  }
}