import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateScheduleDto {
  @IsInt()
  @Min(1)
  @Max(5)
  dayOfWeek!: number; // 1=Lundi ... 5=Vendredi

  @IsString()
  @IsNotEmpty()
  startTime!: string; // "08:00"

  @IsString()
  @IsNotEmpty()
  endTime!: string; // "09:00"

  @IsString()
  @IsOptional()
  room?: string;

  @IsString()
  @IsNotEmpty()
  classId!: string;

  @IsString()
  @IsNotEmpty()
  subjectId!: string;

  @IsString()
  @IsNotEmpty()
  teacherId!: string;
}