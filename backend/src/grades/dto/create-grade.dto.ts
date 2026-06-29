import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateGradeDto {
  @IsNumber({}, { message: 'La note doit être un nombre' })
  @Min(0, { message: 'La note minimum est 0' })
  @Max(20, { message: 'La note maximum est 20' })
  value!: number; // Note sur 20

  @IsNumber()
  @IsOptional()
  maxValue?: number; // Par défaut 20

  @IsString()
  @IsNotEmpty({ message: 'Le type est obligatoire' })
  type!: string; // "devoir", "examen", "contrôle"

  @IsInt()
  @Min(1)
  @Max(5)
  period!: number; // 1 ou 2

  @IsString()
  @IsNotEmpty({ message: "L'année scolaire est obligatoire" })
  academicYear!: string; // "2024-2025"

  @IsString()
  @IsOptional()
  comment?: string; // Appréciation de l'enseignant

  @IsString()
  @IsNotEmpty({ message: "L'élève est obligatoire" })
  studentId!: string;

  @IsString()
  @IsNotEmpty({ message: 'La matière est obligatoire' })
  subjectId!: string;

  @IsString()
  @IsNotEmpty({ message: 'La classe est obligatoire' })
  classId!: string;
}