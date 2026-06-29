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
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classes')
export class ClassesController {
    constructor(private classesService: ClassesService) {}

    @Post()
    @Roles('ADMIN')
    create(@Body() dto: CreateClassDto) {
        return this.classesService.create(dto);
    }

    @Get()
    @Roles('ADMIN', 'TEACHER')
    findAll(
        @Query('academicYear') academicYear?: string,
        @Query('level') level?: string,
    ) {
        return this.classesService.findAll({ academicYear, level });
    }

    @Get('stats')
    @Roles('ADMIN')
    getGlobalStats() {
        return this.classesService.getGlobalStats();
    }

    @Get(':id')
    @Roles('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
    findOne(@Param('id') id: string) {
        return this.classesService.findOne(id);
    }

    @Get(':id/students')
    @Roles('ADMIN', 'TEACHER')
    getStudents(@Param('id') id: string) {
        return this.classesService.getStudents(id);
    }

    @Get(':id/schedule')
    @Roles('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
    getSchedule(@Param('id') id: string) {
        return this.classesService.getSchedule(id);
    }

    @Get(':id/stats')
    @Roles('ADMIN', 'TEACHER')
    getStats(@Param('id') id: string) {
        return this.classesService.getStats(id);
    }

    @Patch(':id')
    @Roles('ADMIN')
    update(@Param('id') id: string, @Body() dto: UpdateClassDto) {
        return this.classesService.update(id, dto);
    }

    @Patch(':id/deactivate')
    @Roles('ADMIN')
    deactivate(@Param('id') id: string) {
        return this.classesService.deactivate(id);
    }
}