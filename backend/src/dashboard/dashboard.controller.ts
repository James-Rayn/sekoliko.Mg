import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  // GET /dashboard/admin → Dashboard administrateur
  @Get('admin')
  @Roles('ADMIN')
  getAdminDashboard(@Query('academicYear') academicYear: string) {
    return this.dashboardService.getAdminDashboard(
      academicYear ?? '2024-2025',
    );
  }

  // GET /dashboard/teacher → Dashboard enseignant
  @Get('teacher')
  @Roles('TEACHER', 'ADMIN')
  getTeacherDashboard(@CurrentUser() user: any) {
    return this.dashboardService.getTeacherDashboard(user.id);
  }

  // GET /dashboard/student → Dashboard élève
  @Get('student')
  @Roles('STUDENT', 'ADMIN')
  getStudentDashboard(
    @CurrentUser() user: any,
    @Query('academicYear') academicYear: string,
  ) {
    return this.dashboardService.getStudentDashboard(
      user.id,
      academicYear ?? '2024-2025',
    );
  }

  // GET /dashboard/parent → Dashboard parent
  @Get('parent')
  @Roles('PARENT', 'ADMIN')
  getParentDashboard(
    @CurrentUser() user: any,
    @Query('academicYear') academicYear: string,
  ) {
    return this.dashboardService.getParentDashboard(
      user.id,
      academicYear ?? '2024-2025',
    );
  }
}