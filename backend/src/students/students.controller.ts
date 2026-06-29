import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { StudentService } from "./students.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { RolesGuard } from "src/auth/roles.guard";
import { CreateStudentDto } from "./dto/create-student.dto";
import { Roles } from "src/auth/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { UpdateStudentDto } from "./dto/update-student.dto";


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentController {
    constructor(private studentService: StudentService) {}

    @Post()
    @Roles('ADMIN')
    create(@Body() dto: CreateStudentDto) {
        return this.studentService.create(dto);
    }

    @Get()
    @Roles('ADMIN', 'TEACHER')
    findAll(
        @Query('classId') classId?: string,
        @Query('isActive') isActive?: string,
    ) {
        return this.studentService.findall({
            classId,
            isActive: isActive === 'true' ? true
                : isActive === 'false' ? false
                : undefined,
        });
    }

    @Get('matricule/:matricule')
    @Roles('ADMIN', 'TEACHER')
    findByMatricule(@Param('matricule') matricule: string) {
        return this.studentService.findByMatricule(matricule)
    }

    @Get(':id')
    @Roles('ADMIN', 'TEACHER', 'PARENT', 'STUDENT')
    findOne(@Param('id') id: string) {
        return this.studentService.findOne(id);
    }

    @Patch(':id')
    @Roles('ADMIN')
    update(
        @Param('id') id: string, 
        @Body() dto: UpdateStudentDto) {
            return this.studentService.update(id, dto);
        }

    @Patch(':id/deactivate')
    @Roles('ADMIN')
    deactivate(@Param('id') id: string) {
        return this.studentService.deactivate(id);
    }

    @Patch(':id/reactivate')
    @Roles('ADMIN')
    reactivate(@Param('id') id: string) {
        return this.studentService.reactivate(id);
    }
}