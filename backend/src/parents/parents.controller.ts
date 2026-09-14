import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ParentsService } from './parents.service';
import { CreateParentDto } from './dto/create-parent.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('parents')
export class ParentsController {
  constructor(private parentsService: ParentsService) {}

  // POST /parents → Créer un parent
  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateParentDto) {
    return this.parentsService.create(dto);
  }

  // GET /parents → Lister tous les parents
  @Get()
  @Roles('ADMIN')
  findAll(@Query('search') search?: string) {
    return this.parentsService.findAll(search);
  }

  // GET /parents/stats → Statistiques
  @Get('stats')
  @Roles('ADMIN')
  getStats() {
    return this.parentsService.getStats();
  }

  // GET /parents/:id → Voir un parent
  @Get(':id')
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.parentsService.findOne(id);
  }

  // PATCH /parents/:id → Modifier un parent
  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: Partial<CreateParentDto>) {
    return this.parentsService.update(id, dto);
  }

  // POST /parents/:id/children → Lier un enfant
  @Post(':id/children')
  @Roles('ADMIN')
  linkChild(
    @Param('id') id: string,
    @Body() body: { studentId: string; relation: string },
  ) {
    return this.parentsService.linkChild(id, body.studentId, body.relation);
  }

  // DELETE /parents/:id/children/:studentId → Délier un enfant
  @Delete(':id/children/:studentId')
  @Roles('ADMIN')
  unlinkChild(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
  ) {
    return this.parentsService.unlinkChild(id, studentId);
  }
}