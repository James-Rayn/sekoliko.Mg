import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  name!: string; // Ex: "Mathématiques"

  @IsString()
  @IsNotEmpty({ message: 'Le code est obligatoire' })
  code!: string; // Ex: "MATH"

  @IsNumber({}, { message: 'Le coefficient doit être un nombre' })
  @Min(0.5, { message: 'Le coefficient minimum est 0.5' })
  @Max(10, { message: 'Le coefficient maximum est 10' })
  @IsOptional()
  coefficient?: number; // Défaut: 1

  @IsString()
  @IsOptional()
  description?: string;
}