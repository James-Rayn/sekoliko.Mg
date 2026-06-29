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
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teachers')
export class TeachersController {
  constructor(private teachersService: TeachersService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateTeacherDto) {
    return this.teachersService.create(dto);
  }

  @Get()
  @Roles('ADMIN')
  findAll(
    @Query('isActive') isActive?: string,
    @Query('speciality') speciality?: string,
  ) {
    return this.teachersService.findAll({
      speciality,
      isActive:
        isActive === 'true' ? true
        : isActive === 'false' ? false
        : undefined,
    });
  }

  @Get('stats')
  @Roles('ADMIN')
  getStats() {
    return this.teachersService.getStats();
  }

  @Get(':id')
  @Roles('ADMIN', 'TEACHER')
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateTeacherDto) {
    return this.teachersService.update(id, dto);
  }

  @Patch(':id/subjects')
  @Roles('ADMIN')
  assignSubjects(
    @Param('id') id: string,
    @Body() body: { subjectIds: string[] },
  ) {
    return this.teachersService.assignSubjects(id, body.subjectIds);
  }

  @Patch(':id/deactivate')
  @Roles('ADMIN')
  deactivate(@Param('id') id: string) {
    return this.teachersService.deactivate(id);
  }

  @Patch(':id/reactivate')
  @Roles('ADMIN')
  reactivate(@Param('id') id: string) {
    return this.teachersService.reactivate(id);
  }
}