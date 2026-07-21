import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { TeachersModule } from './teachers/teachers.module';
import { ClassesModule } from './classes/classes.module';
import { GradesModule } from './grades/grades.module';
import { AttendanceModule } from './attendance/attendance.module';
import { FinanceModule } from './finance/finance.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    StudentsModule,
    TeachersModule,
    ClassesModule,
    GradesModule,
    AttendanceModule,
    FinanceModule,
    MessagesModule
  ],
})
export class AppModule {}
