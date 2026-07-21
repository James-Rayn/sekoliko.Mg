import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subjects')
export class SubjectsController {
  constructor(private subjectsService: SubjectsService) {}

  // POST /subjects → Créer une matière
  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateSubjectDto) {
    return this.subjectsService.create(dto);
  }

  // GET /subjects → Lister toutes les matières
  @Get()
  @Roles('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  findAll() {
    return this.subjectsService.findAll();
  }

  // GET /subjects/code/:code → Voir par code
  // ⚠️ Avant /:id
  @Get('code/:code')
  @Roles('ADMIN', 'TEACHER')
  findByCode(@Param('code') code: string) {
    return this.subjectsService.findByCode(code);
  }

  // GET /subjects/:id/stats → Statistiques
  @Get(':id/stats')
  @Roles('ADMIN', 'TEACHER')
  getStats(@Param('id') id: string) {
    return this.subjectsService.getStats(id);
  }

  // GET /subjects/:id → Voir une matière
  @Get(':id')
  @Roles('ADMIN', 'TEACHER')
  findOne(@Param('id') id: string) {
    return this.subjectsService.findOne(id);
  }

  // PATCH /subjects/:id → Modifier une matière
  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateSubjectDto) {
    return this.subjectsService.update(id, dto);
  }

  // DELETE /subjects/:id → Supprimer une matière
  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(id);
  }
}