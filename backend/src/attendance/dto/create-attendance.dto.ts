import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { AttendanceStatus } from '@prisma/client';

export class CreateAttendanceDto {
  @IsDateString({}, { message: 'Date invalide' })
  @IsNotEmpty({ message: 'La date est obligatoire' })
  date!: string; // "2024-11-15"

  @IsEnum(AttendanceStatus, { message: 'Statut invalide' })
  @IsNotEmpty({ message: 'Le statut est obligatoire' })
  status!: AttendanceStatus; // PRESENT, ABSENT, LATE, EXCUSED

  @IsString()
  @IsOptional()
  reason?: string; // Raison de l'absence ou retard

  @IsString()
  @IsNotEmpty({ message: "L'élève est obligatoire" })
  studentId!: string;
}