import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom de la classe est obligatoire' })
  name!: string; // Ex: "6ème A"

  @IsString()
  @IsNotEmpty({ message: 'Le niveau est obligatoire' })
  level!: string; // Ex: "6ème", "Terminale"

  @IsString()
  @IsNotEmpty({ message: "L'année scolaire est obligatoire" })
  academicYear!: string; // Ex: "2024-2025"

  @IsInt({ message: 'La capacité doit être un nombre entier' })
  @Min(1, { message: 'La capacité minimum est 1' })
  @Max(100, { message: 'La capacité maximum est 100' })
  @IsOptional()
  capacity?: number; // Nombre max d'élèves (défaut: 40)
}